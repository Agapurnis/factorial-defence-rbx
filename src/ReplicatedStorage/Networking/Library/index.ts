import type { NetworkConfiguration, PartialNetworkConfiguration } from "./internal/config";
import { FillConfigurationTemplate } from "./internal/config";
import type { RemoteFunctionCallback } from "./internal/NetworkFunction";
import type { RemoteEventCallback } from "./internal/NetworkEvent";
import type { Function } from "./internal";
import { NetworkInvokableSpecification } from "./internal/base";
import { DefaultNetworkConfiguration } from "./internal/config";
import { NetworkFunction } from "./internal/NetworkFunction";
import { NetworkEvent } from "./internal/NetworkEvent";

type SerializationTransformationRecord = Map<defined, unknown>;

export interface SerdeImplementation <D, S> {
	Deserialize: (serialized: S, network: Network, transformed: SerializationTransformationRecord) => D,
	Serialize: (deserialized: D, network: Network, transformed: SerializationTransformationRecord) => S,
}

type NetworkConnections = NetworkInvokableSpecification | Record<string, NetworkInvokableSpecification | [NetworkConnections]>;
type UnravelNetworkConnections <T extends NetworkConnections> = T extends NetworkFunction<never, never> | NetworkEvent<never, never> ? T : {
		[K in keyof T]: T[K] extends [NetworkConnections] ? UnravelNetworkConnections<T[K][0]>
			: T[K] extends NetworkInvokableSpecification<infer U, infer V, infer W>
				? V extends "Event"
					? NetworkEvent<U, W extends RemoteEventCallback ? W : never>["__with_methods__"]
					: NetworkFunction<U, W extends RemoteFunctionCallback ? W : never>["__with_methods__"]
				: never
};

const IntermediarySerializationFormatPropertyKeys = [
	"$classIdentifier",
	"$classSerialized",
] as const;

interface TransmittedSerializationFormat {
	$classIdentifier: string,
	$classSerialized: unknown,
}

export class Network {
	// #region Serialization
	/**
	 * All serializers and deserializers.
	 */
	private readonly Serde = new Map<string, SerdeImplementation<unknown, unknown>>();

	public Serialize (input: unknown, transformed = new Map() as SerializationTransformationRecord) {
		if (!typeIs(input, "table")) {
			return input;
		}

		// Prevent circular serialization by keeping track of what we've seen.
		if (transformed.has(input)) return transformed.get(input);

		const identifier = tostring(getmetatable(input));

		if (this.Serde.has(identifier)) {
			const [success, serialized] = pcall(() => this.Serde.get(identifier)!.Serialize(input, this, transformed));

			if (!success) {
				warn(`An error occured serializing a value with class identifier '${identifier}'! Using an undefined value.`);
				print(`Serialization error: `, serialized);
				print(`Serialization subject: `, input);
				transformed.set(input, undefined);
				return undefined;
			}

			const formatted = {
				["$classIdentifier"]: identifier,
				["$classSerialized"]: serialized
			} as TransmittedSerializationFormat;

			transformed.set(input, formatted);

			return formatted;
		}

		for (const [key, value] of pairs(input)) {
			input[key as never] = this.Serialize(value) as never;
		}

		return input;
	}

	public Deserialize (input: unknown, transformed = new Map() as SerializationTransformationRecord) {
		if (!typeIs(input, "table")) {
			return input;
		}

		// Prevent circular serialization by keeping track of what we've seen.
		if (transformed.has(input)) return transformed.get(input);

		if (IntermediarySerializationFormatPropertyKeys.every((key) => input[key as keyof typeof input] !== undefined)) {
			const identifier = (input as TransmittedSerializationFormat)["$classIdentifier"];
			const serialized = (input as TransmittedSerializationFormat)["$classSerialized"];

			if (!this.Serde.has(identifier)) {
				warn(`No (de)serializer exists for the identifier '${identifier}'! Using a nil value.`);
				transformed.set(input, undefined);
				return undefined;
			}

			const [success, deserialized] = pcall(() => this.Serde.get(identifier)!.Deserialize(serialized, this, transformed));

			if (!success) {
				warn(`An error occured deserializing a value with class identifier '${identifier}'! Using an undefined value.`);
				print(`Deserialization error: `, deserialized);
				print(`Deserialization subject: `, serialized);
				transformed.set(input, undefined);
				return undefined;
			}

			transformed.set(input, deserialized);

			return deserialized;
		}

		for (const [key, value] of pairs(input)) {
			input[key as never] = this.Deserialize(value) as never;
		}

		return input;
	}

	/**
	 * Registers a serializer/deserializer pair.
	 */
	public AddSerde <U, V> (serde: [constructor: unknown, implementation: SerdeImplementation<U, V>]) {
		const [_constructor, implementation] = serde;
		if (this.Serde.has(tostring(_constructor))) throw `Serializer/deserializer for '${tostring(_constructor)}' already exists.`;
		this.Serde.set(tostring(_constructor), implementation as SerdeImplementation<unknown, unknown>);
		return this;
	}
	// #endregion Serialization
	// #region Activities
	/**
	 * Function fired by the client, ran on the server.
	 */
	public static ServerFunction <T extends Function<never> = Function<unknown>> (
		ParameterTypeValidator?: (parameters: unknown[]) => parameters is Parameters<T>,
		ReturnTypeValidator?: (value: unknown) => value is ReturnType<T>
	): NetworkInvokableSpecification<"Server", "Function", T> {
		return new NetworkInvokableSpecification("Server", "Function", {
			ParameterTypeValidator,
			ReturnTypeValidator
		});
	}
	/**
	 * Event fired by the client, ran on the server.
	 */
	public static ServerEvent <T extends Function<never> = Function<unknown>> (
		ParameterTypeValidator?: (parameters: unknown[]) => parameters is Parameters<T>,
		ReturnTypeValidator?: never
	) {
		const Specification = new NetworkInvokableSpecification("Server", "Event", {
			ParameterTypeValidator,
			ReturnTypeValidator
		});

		return Specification as ReturnType<T> extends void ? typeof Specification
			: { ERR: "Networking event declaration must have a return type of void" };
	}
	/**
	 * Event fired by the server, *ideally* ran on the client.
	 *
	 * Note that this function is not guaranteed to be called on the client.
	 */
	public static ClientEvent <T extends Function<never> = Function<unknown>> (
		ParameterTypeValidator?: (parameters: unknown[]) => parameters is Parameters<T>,
		ReturnTypeValidator?: never
	): ReturnType<T> extends void ? NetworkInvokableSpecification<"Client", "Event", T> : { ERR: "Networking event declaration must have a return type of void" } {
		const Specification = new NetworkInvokableSpecification("Client", "Event", {
			ParameterTypeValidator,
			ReturnTypeValidator
		});

		return Specification as ReturnType<T> extends void ? typeof Specification
			: { ERR: "Networking event declaration must have a return type of void" };
	}
	// #endregion Activities

	public readonly Configuration: NetworkConfiguration = DefaultNetworkConfiguration;

	constructor (configuration: PartialNetworkConfiguration = {}) {
		this.Configuration = FillConfigurationTemplate(configuration, DefaultNetworkConfiguration);
	}

	/**
	 * Builds the network with the provided format.
	 */
	public Build <T extends NetworkConnections> (connections: T) {
		const unraveled = {} as UnravelNetworkConnections<T>;
		const unravel = (held: T, counter: UnravelNetworkConnections<T>, crumbs = "") => {
			for (const [key, value] of pairs(held)) {
				const path = crumbs === "" ? tostring(key) : `${crumbs}/${tostring(key)}`;
				assert((
					typeIs(key, "string") ||
					typeIs(key, "number")
				), `key is not a string or number, it is a '${typeOf(key)}'`);
				if (typeIs(value, "table")) {
					if (value instanceof NetworkInvokableSpecification) {
						// We need to do that dumb cast because an `instanceof` check doesn't fill in generics with defaults, opting to usy `any` instead for whatever reason.
						// The `never` assertions are to avoid generic issues would be a pain to fix otherwise.
						counter[key as never] = (((value as NetworkInvokableSpecification).Type === "Event")
							? new NetworkEvent(value as never, this as never, path)
							: new NetworkFunction(value as never, this as never, path)) as never;
					} else {
						counter[key as never] ??= {} as never;
						unravel((value as [never])[0], counter[key as never], path);
					}
				} else {
					throw "Unexpected type in network declaration";
				}
			}

			return counter;
		};

		return unravel(connections, unraveled);
	}
}


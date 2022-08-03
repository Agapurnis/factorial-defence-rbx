/* eslint-disable @typescript-eslint/no-explicit-any */

import type { NetworkInvokableSpecification } from "./internal/base";
import type { RemoteFunctionCallback } from "./internal/NetworkFunction";
import type { RemoteEventCallback } from "./internal/NetworkEvent";
import { NetworkFunction } from "./internal/NetworkFunction";
import { NetworkEvent } from "./internal/NetworkEvent";

declare class __PROTECTED_CONSTRUCTOR { protected constructor (); }
declare class __PRIVATE_CONSTRUCTOR { private constructor (); }

export interface SerdeImplementation <D, S> {
	Deserialize: (serialized: S, network: Network) => D,
	Serialize: (deserialized: D, network: Network) => S,
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

export class Network {
	// #region Serialization
	/**
	 * All serializers and deserializers.
	 */
	private readonly Serde = new Map<string, SerdeImplementation<unknown, unknown>>();

	public Serialize (input: unknown, seen = new Set<defined>()) {
		if (!typeIs(input, "table")) {
			return input;
		}

		// TODO: See if DOS is achievable, possibly is via ex: [SerializedResult(Ref:SerializedResult)] because we are checking for raw not transformed. or something like that; I dunno, I'm tired.
		if (seen.has(input)) {
			return input;
		}

		seen.add(input);

		const id = tostring(getmetatable(input));

		if (this.Serde.has(id)) {
			const serialized = this.Serde.get(id)!.Serialize(input, this);
			return {
				["$seriID"]: id,
				["$seriDT"]: serialized
			};
		}

		for (const [key, value] of pairs(input)) {
			input[key as never] = this.Serialize(value) as never;
		}

		return input;
	}

	public Deserialize (input: unknown, seen = new Set<defined>()) {
		if (!typeIs(input, "table")) {
			return input;
		}

		// TODO: See if DOS is achievable, possibly is via ex: [SerializedResult(Ref:SerializedResult)] because we are checking for raw not transformed. or something like that; I dunno, I'm tired.
		if (seen.has(input)) {
			return input;
		}

		seen.add(input);

		if (
			"$seriID" in input &&
			"$seriDT" in input
		) {
			const id = (input as { "$seriID": string })["$seriID"];
			const dt = (input as { "$seriDT": object })["$seriDT"];
			return this.Serde.get(id)!.Deserialize(dt, this);
		}

		for (const [key, value] of pairs(input)) {
			input[key as never] = this.Deserialize(value) as never;
		}

		return input;
	}
	// #endregion Serialization
	// #region Activities
	/**
	 * Function fired by the client, ran on the server.
	 */
	public static ServerFunction <T extends (...args: any[]) => unknown = (...args: unknown[]) => unknown> (
		ParameterValidator?: (args: unknown[]) => args is Parameters<T>
	): NetworkInvokableSpecification<"Server", "Function", T> {
		return {
			Type: "Function",
			Scope: "Server",
			FunctionType: undefined as unknown as T,
			ParameterValidator,
			IS_NETWORK_INVOKABLE_SPECIFICATION: true,
		} as NetworkInvokableSpecification<"Server", "Function", T>;
	}
	/**
	 * Event fired by the client, ran on the server.
	 */
	public static ServerEvent <T extends (...args: any[]) => void = (...args: unknown[]) => void> (
		ParameterValidator?: (args: unknown[]) => args is Parameters<T>
	): ReturnType<T> extends void ? NetworkInvokableSpecification<"Server", "Event", T> : { ERR: "Networking event declaration must have a return type of void" } {
		return {
			Type: "Event",
			Scope: "Server",
			FunctionType: undefined as unknown as T,
			ParameterValidator,
			IS_NETWORK_INVOKABLE_SPECIFICATION: true,
		} as ReturnType<T> extends void ? NetworkInvokableSpecification<"Server", "Event", T> : never;
	}
	/**
	 * Event fired by the server, *ideally* ran on the client.
	 *
	 * Note that this function is not guaranteed to be called on the client.
	 */
	public static ClientEvent <T extends (...args: any[]) => void = (...args: unknown[]) => void> (
		ParameterValidator?: (args: unknown[]) => args is Parameters<T>
	): ReturnType<T> extends void ? NetworkInvokableSpecification<"Client", "Event", T> : { ERR: "Networking event declaration must have a return type of void" } {
		return {
			Type: "Event",
			Scope: "Client",
			FunctionType: undefined as unknown as T,
			ParameterValidator,
			IS_NETWORK_INVOKABLE_SPECIFICATION: true,
		} as ReturnType<T> extends void ? NetworkInvokableSpecification<"Client", "Event", T> : never;
	}
	// #endregion Activities

	/**
	 * Registers a serializer/deserializer pair.
	 */
	public AddSerde <U, V> (serde: [constructor: unknown, implementation: SerdeImplementation<U, V>]) {
		const [_constructor, implementation] = serde;
		if (this.Serde.has(tostring(_constructor))) throw `Serializer/deserializer for '${tostring(_constructor)}' already exists.`;
		this.Serde.set(tostring(_constructor), implementation as SerdeImplementation<unknown, unknown>);
		return this;
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
					if ((value as NetworkInvokableSpecification)["IS_NETWORK_INVOKABLE_SPECIFICATION"] !== true) {
						counter[key as never] ??= {} as never;
						unravel((value as never[])[0], counter[key as never], path);
					} else {
						const spec = (value as NetworkInvokableSpecification).Type === "Event"
							? (value as NetworkInvokableSpecification<never, "Event", never>)
							: (value as NetworkInvokableSpecification<never, "Function", never>);
						counter[key as never] = ((spec.Type === "Event")
							? new NetworkEvent(spec, this as never, path)
							: new NetworkFunction(spec, this as never, path)) as never;
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


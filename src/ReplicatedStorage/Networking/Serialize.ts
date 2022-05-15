import { NetBuilder, Serializable, Serialization, SerializationDefinition, SerializedObject } from "@rbxts/netbuilder";
import { Option, Result } from "@rbxts/rust-classes";

export type SerializedResult <T = defined, U = defined> =
	| { Type: "Ok" ; Inner: T }
	| { Type: "Err"; Inner: U };

 export type SerializedOption <T = defined> =
	| { Type: "Some"; Inner: T         }
	| { Type: "None"; Inner: undefined };

export const ResultSerializer = NetBuilder.CreateSerializer<SerializedResult>(Result, {
	Serialize: <T, U> (
		value: Result<T, U>,
		definition: SerializationDefinition
	): SerializedResult<
		T extends Serializable<infer V> ? V : T,
		U extends Serializable<infer V> ? V : U
	> => {
		const Type  = value.isOk() ? "Ok" : "Err";
		const Refnc = value.asPtr();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc }
	},

	Deserialize: <T, U> (
		serialized: SerializedResult<T, U>,
		definition: SerializationDefinition
	): Result<
		T extends SerializedObject<infer V> ? V : T,
		U extends SerializedObject<infer V> ? V : U
	> => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return serialized.Type === "Ok"
			? Result.ok( Serialization.Deserialize(definition, serialized.Inner)) as unknown as Result<T, U>
			: Result.err(Serialization.Deserialize(definition, serialized.Inner)) as unknown as Result<T, U>
	},
});

export const OptionSerializer = NetBuilder.CreateSerializer<SerializedOption>(Option, {
	Serialize: <T> (
		value: Option<T>,
		definition: SerializationDefinition
	): SerializedOption<T extends Serializable<infer U> ? U : T> => {
		const Type  = value.isSome() ? "Some" : "None"
		const Refnc = value.asPtr();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return value.isSome() === true
			? { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc }
			: { Type, Inner: undefined }
	},

	Deserialize: <T> (
		serialized: SerializedOption<T>,
		definition: SerializationDefinition
	): Option<T extends SerializedObject<infer U> ? U : T> => {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return serialized.Type === "Some"
			? Option.some(Serialization.Deserialize(definition, serialized.Inner))
			: Option.none()
	},
});


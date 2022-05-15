import { NetBuilder, Serialization, SerializationDefinition } from "@rbxts/netbuilder";
import { Option, Result } from "@rbxts/rust-classes";

export type SerializedResult =
	| { Type: "Ok" ; Inner: defined }
	| { Type: "Err"; Inner: defined };

 export type SerializedOption =
	| { Type: "Some"; Inner: defined  }
	| { Type: "None"; Inner: undefined };

export const ResultSerializer = NetBuilder.CreateSerializer<SerializedResult>(Result, {
	Serialize: (
		value: Result<defined, defined>,
		definition: SerializationDefinition
	) => {
		const Type  = value.isOk() ? "Ok" : "Err";
		const Refnc = value.asPtr();

		return { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc }
	},

	Deserialize: (
		serialized: SerializedResult,
		definition: SerializationDefinition
	): Result<defined, defined> => {
		return serialized.Type === "Ok"
			? Result.ok( Serialization.Deserialize(definition, serialized.Inner))
			: Result.err(Serialization.Deserialize(definition, serialized.Inner))
	},
});

export const OptionSerializer = NetBuilder.CreateSerializer<SerializedOption>(Option, {
	Serialize: (value: Option<defined>, definition: SerializationDefinition): SerializedOption => {
		const Type  = value.isSome() ? "Some" : "None"
		const Refnc = value.asPtr();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return value.isSome() === true
			? { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc }
			: { Type, Inner: undefined }
	},

	Deserialize: (
		serialized: SerializedOption,
		definition: SerializationDefinition
	): Option<defined> => {
		return serialized.Type === "Some"
			? Option.some(Serialization.Deserialize(definition, serialized.Inner))
			: Option.none()
	},
});


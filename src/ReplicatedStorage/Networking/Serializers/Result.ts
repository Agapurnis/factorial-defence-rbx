import type { SerializationDefinition } from "@rbxts/netbuilder";
import { NetBuilder, Serialization } from "@rbxts/netbuilder";
import { Result } from "@rbxts/rust-classes";

export type SerializedResult =
	| { Type: "Ok" ; Inner: defined }
	| { Type: "Err"; Inner: defined };

export const ResultSerializer = NetBuilder.CreateSerializer<SerializedResult>(Result, {
	Serialize: (
		value: Result<defined, defined>,
		definition: SerializationDefinition
	) => {
		const Type  = value.isOk() ? "Ok" : "Err";
		const Refnc = value.asPtr();

		return { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc };
	},

	Deserialize: (
		serialized: SerializedResult,
		definition: SerializationDefinition
	): Result<defined, defined> => {
		return serialized.Type === "Ok"
			? Result.ok( Serialization.Deserialize(definition, serialized.Inner))
			: Result.err(Serialization.Deserialize(definition, serialized.Inner));
	},
});

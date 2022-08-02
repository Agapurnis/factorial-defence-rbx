import type { SerializationDefinition } from "@rbxts/netbuilder";
import { NetBuilder, Serialization } from "@rbxts/netbuilder";
import { Option } from "@rbxts/rust-classes";

 export type SerializedOption =
	| { Type: "Some"; Inner: defined  }
	| { Type: "None"; Inner: undefined };

export const OptionSerializer = NetBuilder.CreateSerializer<SerializedOption>(Option, {
	Serialize: (value: Option<defined>, definition: SerializationDefinition): SerializedOption => {
		const Type  = value.isSome() ? "Some" : "None";
		const Refnc = value.asPtr();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return value.isSome() === true
			? { Type, Inner: typeIs(Refnc, "table") ? Serialization.Serialize(definition, Refnc) : Refnc }
			: { Type, Inner: undefined };
	},

	Deserialize: (
		serialized: SerializedOption,
		definition: SerializationDefinition
	): Option<defined> => {
		return serialized.Type === "Some"
			? Option.some(Serialization.Deserialize(definition, serialized.Inner))
			: Option.none();
	},
});


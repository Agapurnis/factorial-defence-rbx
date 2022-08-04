import type { SerdeImplementation } from "../Library";
import { Option } from "@rbxts/rust-classes";

export type SerializedOption =
	| { Type: "Some"; Inner: defined  }
	| { Type: "None"; Inner: undefined };

export const OptionSerializer: SerdeImplementation<Option<defined>, SerializedOption> = {
	Serialize: (value, network): SerializedOption => {
		const Type  = value.isSome() ? "Some" : "None";
		const Refnc = value.asPtr();

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore — Generic which is a bit too much of a pain to nicely cast.
		return value.isSome() === true
			? { Type, Inner: network.Serialize(Refnc) }
			: { Type, Inner: undefined };
	},

	Deserialize: (serialized, network) => {
		return serialized.Type === "Some"
			? Option.some(network.Serialize(serialized.Inner) as defined)
			: Option.none();
	},
};


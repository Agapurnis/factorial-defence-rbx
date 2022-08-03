import type { SerdeImplementation } from "../Library";
import { Result } from "@rbxts/rust-classes";

export type SerializedResult =
	| { Type: "Ok" ; Inner: defined }
	| { Type: "Err"; Inner: defined };

export const ResultSerializer: SerdeImplementation<Result<defined, defined>, SerializedResult> = {
	Serialize: (value, network): SerializedResult => {
		const Type  = value.isOk() ? "Ok" : "Err";
		const Refnc = value.asPtr();

		return { Type, Inner: network.Serialize(Refnc) as defined };
	},

	Deserialize: (serialized, network) => {
		return serialized.Type === "Ok"
			? Result.ok( network.Serialize(serialized.Inner) as defined)
			: Result.err(network.Serialize(serialized.Inner) as defined);
	},
};

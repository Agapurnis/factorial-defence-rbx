import { DefinitionBuilder, NetBuilder } from "@rbxts/netbuilder";
import { Result } from "@rbxts/rust-classes";
import { t } from "@rbxts/t";
import type { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";

const ValidateItemReturn = NetBuilder.CreateTypeChecker<Result<true, GenericError>>((v) => {
	return v instanceof Result && (v.asPtr() === true || typeIs(v.asPtr(), "string"));
});

export const MoveItem = new DefinitionBuilder("MoveItem")
	.SetArguments(t.string)
	.SetReturn(ValidateItemReturn)
	.Async()
	.Build();

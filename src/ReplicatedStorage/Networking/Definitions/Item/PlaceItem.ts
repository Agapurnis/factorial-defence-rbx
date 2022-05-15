import { DefinitionBuilder, NetBuilder } from "@rbxts/netbuilder";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { Result } from "@rbxts/rust-classes";
import { t } from "@rbxts/t"

const ValidatePlaceItemReturn = NetBuilder.CreateTypeChecker<Result<true, GenericError>>((v) => {
	return v instanceof Result && (v.asPtr() === true || typeIs(v.asPtr(), "string"));
});

export const PlaceItem = new DefinitionBuilder("PlaceItem")
	.SetArguments(t.string, t.CFrame)
	.SetReturn(ValidatePlaceItemReturn)
	.Async()
	.Build();

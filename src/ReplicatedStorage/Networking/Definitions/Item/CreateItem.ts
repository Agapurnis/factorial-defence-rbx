import { NetBuilder, DefinitionBuilder } from "@rbxts/netbuilder";
import type { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { Result } from "@rbxts/rust-classes";
import type { ItemData } from "ReplicatedStorage/Classes/Item";
import { t } from "@rbxts/t";
import { $terrify } from "rbxts-transformer-t";

const ValidateCreateItemReturn = NetBuilder.CreateTypeChecker<Result<ItemData, GenericError>>((v) => {
	return v instanceof Result && ($terrify<ItemData>()(v.asPtr()) || typeIs(v.asPtr(), "string"));
});

export const CreateItem = new DefinitionBuilder("CreateItem")
	.SetArguments(t.string)
	.SetReturn(ValidateCreateItemReturn)
	.Async()
	.Build();

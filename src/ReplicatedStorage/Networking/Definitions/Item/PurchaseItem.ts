import { NetBuilder, DefinitionBuilder } from "@rbxts/netbuilder";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { Result } from "@rbxts/rust-classes";
import { t } from "@rbxts/t";

export const enum ItemPurchaseError {
	NotEnoughMoney = "NotEnoughMoney",
	CannotPurchase = "CannotPurchase",
}

const ValidatePurchaseItemReturn = NetBuilder.CreateTypeChecker<Result<true, GenericError | ItemPurchaseError>>((v) => {
	return v instanceof Result && (t.boolean(v.asPtr()) || typeIs(v.asPtr(), "string"));
});

export const PurchaseItem = new DefinitionBuilder("PurchaseItem")
	.SetArguments(t.string)
	.SetReturn(ValidatePurchaseItemReturn)
	.Async()
	.Build();

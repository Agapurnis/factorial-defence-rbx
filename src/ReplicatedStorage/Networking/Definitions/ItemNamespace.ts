import { OptionSerializer, ResultSerializer } from "../Serialize";
import { PurchaseItem } from "./Item/PurchaseItem";
import { NetBuilder } from "@rbxts/netbuilder";
import { CreateItem } from "./Item/CreateItem";
import { PlaceItem } from "./Item/PlaceItem";
import { MoveItem } from "./Item/MoveItem";
import { InformInventoryUpdate } from "./Item/InformInventoryUpdate";

export const ItemNetworkingNamespaceName = "Item";
export const ItemNetworkingNamespace = new NetBuilder()
	.UseSerialization([OptionSerializer, ResultSerializer])
	.BindDefinition(InformInventoryUpdate)
	.BindDefinition(PurchaseItem)
	.BindDefinition(CreateItem)
	.BindDefinition(PlaceItem)
	.BindDefinition(MoveItem)
	.AsNamespace()

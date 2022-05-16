import { NetBuilder } from "@rbxts/netbuilder";
import { CurrencyNetworkingNamespace, CurrencyNetworkingNamespaceName } from "./Definitions/CurrencyNamespace";
import { ItemNetworkingNamespace, ItemNetworkingNamespaceName } from "./Definitions/ItemNamespace";
import { UserNetworkingNamespace, UserNetworkingNamespaceName } from "./Definitions/UserNamespace";

export default new NetBuilder()
	.BindNamespace(CurrencyNetworkingNamespaceName, CurrencyNetworkingNamespace)
	.BindNamespace(UserNetworkingNamespaceName, UserNetworkingNamespace)
	.BindNamespace(ItemNetworkingNamespaceName, ItemNetworkingNamespace)
	.Build();

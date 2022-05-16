import { NetBuilder } from "@rbxts/netbuilder";
import { InformBalanceUpdate } from "./Currency/InformBalanceUpdate";

export const CurrencyNetworkingNamespaceName = "Currency";
export const CurrencyNetworkingNamespace = new NetBuilder()
	.BindDefinition(InformBalanceUpdate)
	.AsNamespace();

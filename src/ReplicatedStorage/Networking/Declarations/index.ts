import { NetBuilder } from "@rbxts/netbuilder";
import { ReplicatedStorage } from "@rbxts/services";
import { OptionSerializer } from "../Serializers/Option";
import { ResultSerializer } from "../Serializers/Result";
import MetaMenuNamespace from "./MetaMenu";
import ItemNamespace from "./Item";
import UserNamespace from "./User";

const RemotesFolder = ReplicatedStorage.WaitForChild("Remotes");

export const Remotes = new NetBuilder()
	.UseSerialization([
		OptionSerializer,
		ResultSerializer,
	])
	.Configure({ RootInstance: RemotesFolder })
	.BindNamespace(...MetaMenuNamespace)
	.BindNamespace(...ItemNamespace)
	.BindNamespace(...UserNamespace)
	.Build();

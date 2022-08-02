import { NetBuilder } from "@rbxts/netbuilder";
import { OptionSerializer } from "ReplicatedStorage/Networking/Serializers/Option";
import { ResultSerializer } from "ReplicatedStorage/Networking/Serializers/Result";
import StartMovingItem from "./RemoteFunctions/StartMovingItem";
import CreateItem from "./RemoteFunctions/CreateItem";
import PlaceItem from "./RemoteFunctions/PlaceItem";

export default ["Item", new NetBuilder()
	.UseSerialization([
		OptionSerializer,
		ResultSerializer,
	])
	.BindDefinition(StartMovingItem)
	.BindDefinition(CreateItem)
	.BindDefinition(PlaceItem)
	.AsNamespace()
] as const;

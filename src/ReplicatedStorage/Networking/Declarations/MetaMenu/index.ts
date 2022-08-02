import { NetBuilder } from "@rbxts/netbuilder";
import { OptionSerializer } from "ReplicatedStorage/Networking/Serializers/Option";
import { ResultSerializer } from "ReplicatedStorage/Networking/Serializers/Result";
import MetaMenuLogEvent from "./RemoteEvents/MetaMenuLogEvent";

export default ["MetaMenu", new NetBuilder()
	.UseSerialization([
		OptionSerializer,
		ResultSerializer,
	])
	.BindDefinition(MetaMenuLogEvent)
	.AsNamespace()
] as const;

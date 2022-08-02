import { NetBuilder } from "@rbxts/netbuilder";
import { OptionSerializer } from "ReplicatedStorage/Networking/Serializers/Option";
import { ResultSerializer } from "ReplicatedStorage/Networking/Serializers/Result";
import DeleteData from "./RemoteFunctions/DeleteData";
import SaveData from "./RemoteFunctions/SaveData";

export default ["User", new NetBuilder()
	.UseSerialization([
		OptionSerializer,
		ResultSerializer,
	])
	.BindDefinition(DeleteData)
	.BindDefinition(SaveData)
	.AsNamespace()
] as const;

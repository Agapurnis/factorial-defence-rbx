import { OptionSerializer, ResultSerializer } from "../Serialize";
import { NetBuilder } from "@rbxts/netbuilder";
import { CreateUser } from "./User/CreateUser";
import { DeleteUser } from "./User/DeleteUser";
import { LoadUser } from "./User/LoadUser";

export const UserNetworkingNamespaceName = "User";
export const UserNetworkingNamespace = new NetBuilder()
	.UseSerialization([OptionSerializer, ResultSerializer])
	.BindDefinition(DeleteUser)
	.BindDefinition(CreateUser)
	.BindDefinition(LoadUser)
	.AsNamespace();

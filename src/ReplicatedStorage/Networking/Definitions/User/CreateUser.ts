import type { UserData } from "ReplicatedStorage/Classes/User";
import { NetBuilder, DefinitionBuilder } from "@rbxts/netbuilder";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { Result } from "@rbxts/rust-classes";
import { $terrify } from "rbxts-transformer-t";

const ValidateCreateUserReturn = NetBuilder.CreateTypeChecker<Result<UserData, GenericError>>((v) => {
	return v instanceof Result && (typeIs(v.asPtr(), "string") || $terrify<UserData>()(v.asPtr()))
});

export const CreateUser = new DefinitionBuilder("CreateUser").SetReturn(ValidateCreateUserReturn).Build();

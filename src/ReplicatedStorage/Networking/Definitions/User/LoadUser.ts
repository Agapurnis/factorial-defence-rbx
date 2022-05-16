import { NetBuilder, DefinitionBuilder } from "@rbxts/netbuilder";
import type { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { $terrify } from "rbxts-transformer-t";
import type { UserData } from "ReplicatedStorage/Classes/User";
import { Result } from "@rbxts/rust-classes";

export const enum LoadUserError {
	OutdatedServer = "OutdatedServer",
}

const ValidateLoadUserReturn = NetBuilder.CreateTypeChecker<Result<UserData, GenericError | LoadUserError>>((v) => {
	return v instanceof Result && (typeIs(v.asPtr(), "string") || $terrify<UserData>()(v.asPtr()));
});


export const LoadUser = new DefinitionBuilder("LoadUser").SetReturn(ValidateLoadUserReturn).Build();

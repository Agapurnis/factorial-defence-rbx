import type { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import type { GenericError } from "ReplicatedStorage/Networking/GenericError";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";
import { Result } from "@rbxts/rust-classes";

/**
 * [0] FullDeletion: boolean - If true, as much data as possible will be removed.
 */
type DeleteUserDataInput = [FullDeletion: boolean];
type DeleteUserDataOutput = Result<true, UserDataServiceError | GenericError>;

function ValidateDeleteUserDataArguments (value: unknown): value is DeleteUserDataInput {
	return $terrify<DeleteUserDataInput>()(value);
}

function ValidateDeleteUserDataReturn (value: unknown): value is DeleteUserDataOutput {
	return value instanceof Result && (value.isOk() ? (value.asPtr() === true) : typeIs(value.asPtr(), "string"));
}

export default new DefinitionBuilder("DeleteData")
	.SetArguments(ValidateDeleteUserDataArguments)
	.SetReturn(ValidateDeleteUserDataReturn)
	.Build();

import type { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import type { GenericError } from "ReplicatedStorage/Networking/GenericError";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";
import { Result } from "@rbxts/rust-classes";

type SaveUserDataInput = [];
type SaveUserDataOutput = Result<true, UserDataServiceError | GenericError>;

function ValidateSaveUserDataArguments (value: unknown): value is SaveUserDataInput {
	return $terrify<SaveUserDataInput>()(value);
}

function ValidateSaveUserDataReturn (value: unknown): value is SaveUserDataOutput {
	return value instanceof Result && (value.isOk() ? (value.asPtr() === true) : typeIs(value.asPtr(), "string"));
}

export default new DefinitionBuilder("SaveData")
	.SetArguments(ValidateSaveUserDataArguments)
	.SetReturn(ValidateSaveUserDataReturn)
	.Build();

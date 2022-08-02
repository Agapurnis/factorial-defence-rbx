import type { GenericError } from "ReplicatedStorage/Networking/GenericError";
import type { ItemMovementError } from "ReplicatedStorage/Enums/Errors/ItemMovementError";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";
import { Result } from "@rbxts/rust-classes";

export type CreateItemInput = [uuid: string];
export type CreateItemOutput = Result<string, GenericError | ItemMovementError>;

function ValidateCreateItemArguments (value: unknown): value is CreateItemInput {
	return $terrify<CreateItemInput>()(value);
}

function ValidateCreateItemReturn (value: unknown): value is CreateItemOutput {
	return value instanceof Result && typeIs(value.asPtr(), "string");
}

export default new DefinitionBuilder("CreateItem")
	.SetArguments(ValidateCreateItemArguments)
	.SetReturn(ValidateCreateItemReturn)
	.Build();

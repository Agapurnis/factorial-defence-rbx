import type { GenericError } from "ReplicatedStorage/Networking/GenericError";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";
import { Result } from "@rbxts/rust-classes";

export type StartMovingItemInput = [uuid: string];
export type StartMovingItemOutput = Result<true, GenericError>;

function ValidateStartMovingItemItemArguments (value: unknown): value is StartMovingItemInput {
	return $terrify<StartMovingItemInput>()(value);
}

function ValidateStartMovingItemItemReturn (value: unknown): value is StartMovingItemOutput {
	return value instanceof Result && (value.isOk() ? (value.unwrap() === true) : typeIs(value.asPtr(), "string"));
}

export default new DefinitionBuilder("StartMovingItem")
	.SetArguments(ValidateStartMovingItemItemArguments)
	.SetReturn(ValidateStartMovingItemItemReturn)
	.Build();

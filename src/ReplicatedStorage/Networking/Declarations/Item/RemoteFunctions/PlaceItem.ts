import type { GenericError } from "ReplicatedStorage/Networking/GenericError";
import type { ItemMovementError } from "ReplicatedStorage/Enums/Errors/ItemMovementError";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";
import { Result } from "@rbxts/rust-classes";

type ExtractLuaTuple <T extends LuaTuple<unknown[]>> = T extends LuaTuple<infer U> ? U : never;
type CFrameComponents = ExtractLuaTuple<ReturnType<CFrame["GetComponents"]>>;

export type PlaceItemInput = [uuid: string, position: CFrameComponents];
export type PlaceItemOutput = Result<CFrameComponents, GenericError | ItemMovementError>;

function ValidatePlaceItemArguments (value: unknown): value is PlaceItemInput {
	return $terrify<PlaceItemInput>()(value);
}

function ValidatePlaceItemReturn (value: unknown): value is PlaceItemOutput {
	return value instanceof Result && (value.isOk() ? typeIs(value.asPtr(), "table") : typeIs(value.asPtr(), "string"));
}

export default new DefinitionBuilder("PlaceItem")
	.SetArguments(ValidatePlaceItemArguments)
	.SetReturn(ValidatePlaceItemReturn)
	.Build();

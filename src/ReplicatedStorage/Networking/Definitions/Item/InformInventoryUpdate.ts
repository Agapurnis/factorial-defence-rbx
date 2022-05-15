import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";

export const InformInventoryUpdate = new DefinitionBuilder("InformInventoryUpdate").SetArguments($terrify<[string, number][]>()).Build()
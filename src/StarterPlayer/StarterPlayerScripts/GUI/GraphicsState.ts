import type { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import type { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import type { GraphicsSelected } from "./GraphicsSelected";
import type { ContextOptions } from "@rbxts/gamejoy/out/Definitions/Types";
import { Context } from "@rbxts/gamejoy";


export const GraphicsState: {
	input: Context<ContextOptions>,
	over: "NONE" | GraphicsSelected,
	item: "NONE" | ItemRegister<ItemTraitEnum[], ItemTrait>
} = {
	input: new Context(),
	over: "NONE",
	item: "NONE"
};


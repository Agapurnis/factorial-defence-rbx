import type Roact from "@rbxts/roact";
import BasicState from "@rbxts/basicstate";

import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { ItemRegister } from "ReplicatedStorage/Items/ItemRegister";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";

export const InventoryState = new BasicState({
	Active: false,
	Hovering: "NONE" as ItemRegister<ItemTraitEnum[], ItemTrait<ItemTraitEnum>> | "NONE",
	ToggleButton: Enum.KeyCode.Backquote as Enum.KeyCode | "NONE",
	ToggleOpenSound: "rbxassetid://9119738974" as string | "NONE",
	ToggleOpenSpeed: 0.8,
	ToggleCloseSound: "rbxassetid://9119712147" as string | "NONE",
	ToggleCloseSpeed: 1,
	Theme: {}
});

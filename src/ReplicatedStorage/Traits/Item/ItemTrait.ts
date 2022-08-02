import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { Conveyor } from "./Interfaces/Conveyor";
import type { Upgrader } from "./Interfaces/Upgrader";
import type { Dropper } from "./Interfaces/Dropper";
import type { Furnace } from "./Interfaces/Furnace";

export type ItemTrait <T extends ItemTraitEnum = ItemTraitEnum> = ItemTraitLookup[T];
export type ItemTraitLookup = {
	[ItemTraitEnum.DROPPER]: Dropper,
	[ItemTraitEnum.FURNACE]: Furnace,
	[ItemTraitEnum.UPGRADER]: Upgrader,
	[ItemTraitEnum.CONVEYOR]: Conveyor,
};

export {
	Conveyor,
	Upgrader,
	Dropper,
	Furnace,
};

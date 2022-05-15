import type { Conveyor } from "./Traits/Conveyor";
import type { Dropper } from "./Traits/Dropper";
import type { Furnace } from "./Traits/Furnace";
import type { Upgrader } from "./Traits/Upgrader";

export const enum ItemTraitEnum {
	DROPPER = "DROPPER", // creates ores
	FURNACE = "FURNACE", // destroys ores (sells)
	UPGRADER = "UPGRADER", // upgrades ores
	CONVEYOR = "CONVEYOR", // moves ores
}

export type ItemTrait <T extends ItemTraitEnum = ItemTraitEnum> = ItemTraitLookup[T]
export type ItemTraitLookup = {
	[ItemTraitEnum.DROPPER]: Dropper,
	[ItemTraitEnum.FURNACE]: Furnace,
	[ItemTraitEnum.UPGRADER]: Upgrader,
	[ItemTraitEnum.CONVEYOR]: Conveyor,
}



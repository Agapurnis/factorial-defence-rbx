import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import * as ItemTraitImplementation from "../Traits/Item/ItemTrait";

export { ItemTraitEnum };
export { ItemTraitImplementation };
export type ItemTrait <T extends ItemTraitEnum = ItemTraitEnum> = ItemTraitLookup[T];
export type ItemTraitLookup = {
	[ItemTraitEnum.DROPPER]: ItemTraitImplementation.Dropper,
	[ItemTraitEnum.FURNACE]: ItemTraitImplementation.Furnace,
	[ItemTraitEnum.UPGRADER]: ItemTraitImplementation.Upgrader,
	[ItemTraitEnum.CONVEYOR]: ItemTraitImplementation.Conveyor,
};

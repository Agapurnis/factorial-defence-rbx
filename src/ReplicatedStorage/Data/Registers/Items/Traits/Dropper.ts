import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

export interface Dropper {
	drop (item: Item<Dropper>): Ore;
}

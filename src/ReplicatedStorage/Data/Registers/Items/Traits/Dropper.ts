import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

/**
 * The `Dropper` trait schema implementation.
 */
export interface Dropper {
	/**
	 * @param item — The item instance that is creating the ore.
	 * @returns the newly created ore
	 */
	drop (item: Item<Dropper>): Ore;
}

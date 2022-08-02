import type { OreComponent } from "ReplicatedStorage/Components/Ore";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";

/**
 * The `Dropper` trait schema implementation.
 */
export interface Dropper {
	/**
	 * @param item - The item instance that is creating the ore.
	 * @returns the newly created ore
	 */
	drop (item: ItemComponent<Dropper>): Promise<OreComponent>;
	/**
	 * The interval at which the dropper drops at, (in milliseconds)
	 */
	dropSpeed: number;
}

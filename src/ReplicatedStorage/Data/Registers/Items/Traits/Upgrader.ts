import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

/**
 * The `Upgrader` trait schema implementation.
 */
export interface Upgrader {
	/**
	 * Note: does not return new ore, mutates the given ore.
	 */
	upgrade (ore: Ore, item: Item<Upgrader>): void;
}

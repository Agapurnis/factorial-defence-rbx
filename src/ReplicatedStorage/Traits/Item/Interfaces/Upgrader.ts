import type { OreComponent } from "ReplicatedStorage/Components/Ore";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";

/**
 * The `Upgrader` trait schema implementation.
 */
export interface Upgrader {
	/**
	 * Note: does not return new ore, mutates the given ore.
	 * @param ore - Ore to use for value calculation.
	 * @param item - The item instance that is upgrading the ore.
	 */
	upgrade (ore: OreComponent, item: ItemComponent<Upgrader>): void;
}

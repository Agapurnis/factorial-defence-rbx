import type { OreComponent } from "ReplicatedStorage/Components/Ore";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";

/**
 * The `Furnace` trait schema implementation.
 */
export interface Furnace {
	/**
	 * @param ore - Ore to use for value calculation.
	 * @param item - The item instance that is selling the ore.
	 */
	sell (ore: OreComponent, item: ItemComponent<Furnace>): void;
}

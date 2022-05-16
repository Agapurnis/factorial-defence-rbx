import type { User } from "ReplicatedStorage/Classes/User";
import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

/**
 * The `Furnace` trait schema implementation.
 */
export interface Furnace {
	/**
	 * @param ore — Ore to use for value calculation.
	 * @param item — The item instance that is selling the ore.
	 * @param user — The user that is selling the ore.
	 */
	sell (ore: Ore, item: Item<Furnace>, user: User): void;
}

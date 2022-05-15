import type { User } from "ReplicatedStorage/Classes/User";
import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

export interface Furnace {
	sell (ore: Ore, item: Item<Furnace>, user: User): void;
}

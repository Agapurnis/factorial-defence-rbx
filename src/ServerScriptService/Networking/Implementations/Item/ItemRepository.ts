import { Option } from "@rbxts/rust-classes";
import type { Item } from "ReplicatedStorage/Classes/Item";

export const ItemRepository = new class ItemRepository {
	/**
	 * Cached items on the server, keyed by their instance ID.
	 */
	public readonly Cache = new Map<string, Item>();
	/**
	 * Items instance IDs that are currently 'in movement'.
	 *
	 * If an item is not 'in movement', any placement requests are denied.
	 * We keep track of this to make sure we don't have psuedo-items that aren't actually placed but are still active.
	 */
	public readonly InMovement = new Set<string>();


	public get (id: string): Option<Item> {
		return Option.wrap(this.Cache.get(id));
	}

	public delete (id: string): void {
		this.Cache.delete(id);
	}

	public has (id: string): boolean {
		return this.Cache.has(id);
	}

	public set <T extends Item> (id: string, value: T): T {
		this.Cache.set(id, value);
		return value;
	}
};

import DataStore2 from "@rbxts/datastore2";
import { Option } from "@rbxts/rust-classes";
import { User, UserData } from "ReplicatedStorage/Classes/User";
import { UserMigrations } from "ServerScriptService/Storage/Migrations";
import { UserStoreKey, UserStores } from "ServerScriptService/Storage/UserStore";
import { ItemRepository } from "../Item/ItemRepository";

function identifier (value: Player | number): number {
	return typeIs(value, "number") ? value : value.UserId;
}

export const UserRepository = new class UserRepository {
	/**
	 * Cached users on the server, keyed by their player ID.
	 */
	private cache = new Map<number, User>();

	public get (player: Player): Option<User>
	public get (id: number): Option<User>
	public get (key: number | Player): Option<User> {
		return Option.wrap(this.cache.get(identifier(key)))
	}

	/**
	 * **Deletes all data assosciated with the user.**
	 * @param player The player to delete data from.
	 * @returns Whether or not the user was deleted.
	 */
	public delete (player: Player): boolean
	public delete (id: number): boolean
	public delete (key: number | Player): boolean {
		const player = typeIs(key, "number") ? { ClassName: "Player", UserId: key } as Player : key;
		const store = UserStores.get(identifier(key)) ?? DataStore2<UserData>(UserStoreKey, player); if (!store) return false;
		const user = this.get(player);

		if (user.isSome()) {
			for (const [id, item] of pairs(user.unwrap().inventory.items)) {
				ItemRepository.delete(id)
				item.timer?.destroy()
				item.ores?.forEach((ore) => ore.part.Destroy())
				item.model.Destroy()
			}
		}

		this.cache.delete(player.UserId);

		store.Set(undefined!);
		store.Save();
		UserStores.delete(player.UserId);

		return true
	}

	public has (player: Player): boolean
	public has (id: number): boolean
	public has (key: number | Player): boolean {
		return this.cache.has(identifier(key));
	}

	public migrate (data: UserData): UserData {
		const timestamp = DateTime.now().UnixTimestampMillis;
		let migration = data.joined[2];
		data.joined ??= [timestamp, -1]; // pre-migration did not have any timestamp data
		UserMigrations.filter(([t]) => t > data.joined[1]).forEach(([t, f]) => { migration = (migration ?? 0) < t ? t : migration; data = f(data) });
		data.joined[1] = DateTime.now().UnixTimestampMillis;
		data.joined[2] = migration
		return data
	}

	public forEach (callback: (user: User, index: number) => void): void {
		this.cache.forEach(callback)
	}

	public set <T extends User> (player: Player, value: T): T
	public set <T extends User> (id: number, value: T): T
	public set <T extends User> (key: number | Player, value: T): T {
		this.cache.set(identifier(key), value);
		return value;
	}
}


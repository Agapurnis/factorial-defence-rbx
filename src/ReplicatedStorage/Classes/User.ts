import type { ItemData } from "./Item";
import { Item } from "./Item";
import { PlacementBehavior } from "ReplicatedStorage/Data/Enums/Settings/PlacemodeBehavior";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";

/**
 * Underlying serialized data of a user.
 *
 * Used for tranmission and storage.
 */
export interface UserData {
	settings: CustomUserSettings
	inventory: {
		count: Record<string, number>;
		items: Record<string, ItemData>;
	}
	currency: Record<string, number>;
	joined: [ever: number, latest: number, migration?: number]
}

export interface CustomUserSettings {
	placement: {
		behavior: [behavior: PlacementBehavior, center: boolean]
	}
}

/**
 * The `User` class is a wrapper for the underlying `Player`, which is the internal representation of the person interfacing with the game.
 *
 * A `Player` is the standardized Roblox-specific representation, while a `User` contains behavior that is specific to this game/experience.
 *
 * @see {@link Player Player}
 *
 * The `User` class is used both by the client and server, but
 * the server will retain ownership of the underlying data when applicable in all circumstances.
 *
 * ----
 *
 * Note that the persistance of mutations done to the class
 * is dependant on proper usage of the `UserRepository` on the server.
 *
 * @see {@link UserRepository UserRepository}
 *
 * A static utility method provided on this class is `update`, which takes in `UserData` and applies the data to a class instance.
 *
 * The `UserData` interface is also how the data of a User is stored and transmitted.
 *
 * @see {@link UserData UserData}
 */
export class User {
	public settings: CustomUserSettings = {
		placement: {
			behavior: [PlacementBehavior.OFF_OF_TARGET, true]
		}
	};

	/**
	 * The items (both 'in storage' and 'active' the user possesses.
	 *
	 * @property count — How much of an item type (keyed by register ID) is in storage.
	 * @property items — Key-value record of 'active' items, a value being keyed by it's instance ID.
	 */
	public inventory: {
		/**
		 * A record of the amount of items that are owned of an item type that are not currently being used.
		 */
		count: Record<string, number>,
		/**
		 * A record of the items that are owned of an item type that *are* currently being used.
		 */
		items: Record<string, Item>,
	} = {
		count: {},
		items: {},
	};

	/**
	 * UTC timestamps (milliseconds, whole number) of when a user joined.
	 *
	 * [0]: Timestamp of the first recorded join.
	 * [1]: Timestamp of the most recent join.
	 * [2]: Timestamp/identifier of the latest migration applied.
	 *
	 * Used for migrations, analytics, and benefits.
	 */
	public joined: [ever: number, latest: number, migration?: number];

	/**
	 * How much of each type of currency a user has.
	 */
	public money: Record<Currency, number> = {
		[Currency.FREE]: 10,
		[Currency.PAID]: 0,
	};

	constructor (
		/**
		 * The underlying player of a user.
		 *
		 * The source of the numeric unique primary identifier of the user (`Player.UserID`).
		 *
		 * This technically may not always be present, as a reference may be invalid during deconstructon.
		 * Shortly afterwards, the assosciited user will be destroyed. No real issues sould occur from this fact.
		 */
		public readonly player: Player
	) {
		const timestamp = DateTime.now().UnixTimestampMillis;
		this.joined = [timestamp, timestamp];
	}

	// #region Serde, Mut
	public serialize (): UserData {
		const itemData: Record<string, ItemData> = {};
		for (const [id, item] of pairs(this.inventory.items)) {
			itemData[id] = item.Serialize();
		}

		return {
			inventory: {
				count: this.inventory.count,
				items: itemData,
			},
			settings: this.settings,
			currency: this.money,
			joined: this.joined,
		};
	}

	/**
	 * Overrides data with given data.
	 * Also updates items of user.
	 */
	public update (data: UserData) {
		this.settings = data.settings;
		this.joined = data.joined;
		this.money = data.currency;

		for (const [id, item] of pairs(this.inventory.items)) {
			if (data.inventory.items[id]) {
				this.inventory.items[id] = item.update(data.inventory.items[id]);
			} else {
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore - Item was removed.
				this.inventory.items[id] = undefined;
			}
		}

		return this;
	}

	public static Deserialize (player: Player, data: UserData, into = new User(player)) {
		into.settings = data.settings;
		into.joined = data.joined;
		into.money = data.currency;
		into.inventory.count = data.inventory.count;
		for (const [id, item] of pairs(data.inventory.items)) {
			into.inventory.items[id] = Item.Deserialize(into, item);
		}
		return into;
	}
	// #endregion Serde, Mut
}

import type { ItemComponent, ItemData } from "./Item";
import { Component, BaseComponent } from "@flamework/components";
import { getSymmetricEnumMembers } from "ReplicatedStorage/Utility/GetEnumMembers";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import { Option } from "@rbxts/rust-classes";

type CurrencyBalanceAttribute = `${typeof CurrencyBalanceAttributePrefix}${keyof typeof Currency}`;
const CurrencyBalanceAttributePrefix = "Balance_" as const;
const CurrencyBalanceAttributeEmptyWallet: Record<CurrencyBalanceAttribute, number> = getSymmetricEnumMembers(Currency).reduce((obj, currency) => { obj[`${CurrencyBalanceAttributePrefix}${currency}`] = 0; return obj; }, {} as Record<CurrencyBalanceAttribute, number>);

type UserComponentInstance = Player;
type UserComponentAttributes = { [K in CurrencyBalanceAttribute]: number };

/**
 * The format that a user's saved data takes.
 */
export interface UserData {
	Items: Record<string, ItemData>,
	Balance: Record<Currency, number>,
	Statistics: {
		TimePlayed: number,
		FirstJoin: number,
		LastJoin: number,
	}
}

@Component({
	tag: CollectionTag.USER,
	defaults: {
		...CurrencyBalanceAttributeEmptyWallet,
	}
})
export class UserComponent extends BaseComponent<
	UserComponentAttributes,
	UserComponentInstance
> {
	/**
	 * Export this item as storable data.
	 * @server
	 */
	public AsData (stats: UserData["Statistics"]): UserData {
		return {
			Items: [...this.PlacedItems].reduce((obj, [uuid, item]) => { obj[uuid] = item.AsData(); return obj; }, {} as Record<string, ItemData>),
			Balance: getSymmetricEnumMembers(Currency).reduce((obj, currency) => { obj[currency] = this.attributes[`${CurrencyBalanceAttributePrefix}${currency}`]; return obj; }, {} as Record<Currency, number>),
			Statistics: {
				TimePlayed: stats["TimePlayed"] + (DateTime.now().UnixTimestampMillis - this.ServerJoinTime),
				FirstJoin: stats["FirstJoin"] ?? this.ServerJoinTime,
				LastJoin: this.ServerJoinTime,
			},
		};
	}

	/**
	 * The time at which the user joined the session, stored in milliseconds (UTC).
	 */
	public readonly ServerJoinTime = DateTime.now().UnixTimestampMillis;
	/**
	 * All of the items currently placed down by the user.
	 */
	public readonly PlacedItems = new Map<string, ItemComponent>();
	/**
	 * Whether or not to save when the user logs out.
	 */
	public SaveOnLogout = true;
	/**
	 * The last time the user saved during this session, stored as seconds with an arbritrary starting point.
	 */
	public LastSaved = Option.none<number>();
}

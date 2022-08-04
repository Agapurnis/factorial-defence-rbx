import type { ItemComponent } from "./Item";
import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import { PhysicsService, TweenService } from "@rbxts/services";
import { Component, BaseComponent } from "@flamework/components";
import { getSymmetricEnumMembers } from "ReplicatedStorage/Utility/GetEnumMembers";
import { CollisionGroup } from "ReplicatedStorage/Enums/CollisionGroup";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import { Option } from "@rbxts/rust-classes";

/**
 * A record of what item upgraded an ore, and the UTC timestamp at which it occured.
 */
type StampedUpgrade = [ItemComponent<ItemTrait<ItemTraitEnum.UPGRADER>>, number];

type CurrencyOreValueAttribute = `${typeof CurrencyOreValueAttributePrefix}${keyof typeof Currency}`;
const CurrencyOreValueAttributePrefix = "Value_" as const;
const CurrencyOreValueAttributeEmptyWorth: Record<CurrencyOreValueAttribute, number> = getSymmetricEnumMembers(Currency).reduce((obj, currency) => { obj[`${CurrencyOreValueAttributePrefix}${currency}`] = 0; return obj; }, {} as Record<CurrencyOreValueAttribute, number>);

type OreComponentInstance = Part;
type OreComponentAttributes = {
	[K in CurrencyOreValueAttribute]: number;
};

@Component({
	tag: CollectionTag.ORE,
	defaults: {
		...CurrencyOreValueAttributeEmptyWorth
	}
})
export class OreComponent extends BaseComponent<
	OreComponentAttributes,
	OreComponentInstance
> {
	public readonly source = Option.none<ItemComponent<ItemTrait<ItemTraitEnum.DROPPER>>>();

	/**
	 * Whether or not this ore can be sold/upgraded.
	 *
	 * This is set to `false` when it is first sold.
	 */
	public Enabled = true;

	public Upgrades: {
		list: StampedUpgrade[],
		/** registers */ reg: Map<string, StampedUpgrade[]>
		/** instances */ map: Map<string, StampedUpgrade[]>
	} = {
		list: [],
		reg: new Map(),
		map: new Map(),
	};

	public StampUpgrade (item: ItemComponent<ItemTrait<ItemTraitEnum.UPGRADER>>) {
		const stamp = [item, game.Workspace.GetServerTimeNow()] as StampedUpgrade;
		this.Upgrades.list.push(stamp);
		const registerStamps = this.Upgrades.map.get(item.attributes.ItemRegisterUUID) ?? [];
		const instanceStamps = this.Upgrades.map.get(item.attributes.ItemInstanceUUID) ?? [];
		registerStamps.push(stamp);
		instanceStamps.push(stamp);
		this.Upgrades.reg.set(item.attributes.ItemRegisterUUID, registerStamps);
		this.Upgrades.map.set(item.attributes.ItemInstanceUUID, instanceStamps);
	}
}

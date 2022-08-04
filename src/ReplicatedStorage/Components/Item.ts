import type { UserComponent } from "./User";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import type { ItemRegister } from "ReplicatedStorage/Items/ItemRegister";
import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { Components } from "@flamework/components";
import { BaseComponent } from "@flamework/components";
import { Dependency } from "@flamework/core";
import { Component } from "@flamework/components";
import { Players } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { ItemRegistry } from "ReplicatedStorage/Items/ItemRegistry";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";

export interface ItemComponentInstance extends Model {}
export interface ItemComponentAttributes {
	/**
	 * Numeric posessor Player identifier.
	 */
	readonly User: number,
	readonly ItemInstanceUUID: string,
	readonly ItemRegisterUUID: string,
}

type ExtractLuaTuple <T extends LuaTuple<unknown[]>> = T extends LuaTuple<infer U> ? U : never;
type CFrameComponents = ExtractLuaTuple<ReturnType<CFrame["GetComponents"]>>;

/**
 * The format that a saved item takes.
 */
export interface ItemData {
	CFrameComponents: CFrameComponents,
	Register: string,
}

@Component({
	tag: CollectionTag.ITEM,
})
export class ItemComponent <
	// Item Traits
	T extends ItemTrait = ItemTrait,
	U extends ItemTraitEnum[] = ItemTraitEnum[],
	// Component Details
	V extends ItemComponentAttributes = ItemComponentAttributes,
	W extends ItemComponentInstance = ItemComponentInstance,
> extends BaseComponent<V, W> {
	/**
	 * @param trait - the trait to check for
	 * @returns whether or not this item has the trait
	 */
	public HasTrait <X extends ItemTraitEnum> (trait: X): this is ItemComponent<T & ItemTrait<X>, [...U, X], V, W>  {
		return this.Register.traits.includes(trait);
	}

	/**
	 * Export this item as storable data.
	 * @server
	 */
	public AsData (): ItemData {
		return {
			Register: this.Register.id,
			CFrameComponents: this.instance.GetPivot().GetComponents(),
		};
	}

	/**
	 * Owner of this item.
	 */
	public readonly Owner: UserComponent;
	public readonly Register: ItemRegister<U, T>;

	/**
	 * Whether or not to actually function (drop ores, sell ores, upgrade ores, e.t.c.)
	 *
	 * This is set to `false` when the item is being moved.
	 */
	public Enabled = true;

	/**
	 * Whether or not the item can move to the provided position without any collisions occuring.
	 */
	public CanMoveTo (position: CFrame): boolean {
		const filter = (part: BasePart) => {
			return !(part.GetAttribute("DoesNotBlockPlacement") as boolean | undefined ?? false) && !(part.IsDescendantOf(this.instance));
		};

		// Move a clone of the item's model to the new location.
		const clone = this.instance.Clone();
		clone.Parent = undefined;
		clone.PivotTo(position);

		// Check for any collisions in the new position.
		const region = new ComplexRegion(clone, filter);
		const parts = region.FindPartsInRegion(undefined, filter);

		// Destroy the clone.
		clone.Destroy();

		// Return whether or not any collisions occured.
		return parts.isEmpty();
	}

	/**
	 * Whether or not the item is currently colliding with anything.
	 */
	public IsColliding () {
		// This actually just checks if it can move it its own position.
		return !this.CanMoveTo(this.instance.GetPivot());
	}

	constructor () {
		super();

		const player = Players.GetPlayerByUserId(this.attributes.User);
		assert(player, "expected a valid player on item attribute");

		this.Register = ItemRegistry[this.attributes.ItemRegisterUUID] as unknown as ItemRegister<U, T>;
		this.Owner = Dependency<Components>().getComponent<UserComponent>(player)!;
	}
}


import type { Ore } from "./Ore";
import type { Timer } from "@rbxts/timer";
import type { Serializable } from "@rbxts/netbuilder";
import type { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import type { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { ItemRegistry } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";
import { CollectionService, HttpService, RunService, TweenService } from "@rbxts/services";
import { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { addConveyorFunctionality } from "ReplicatedStorage/Utility/ItemFunctionality/ConveyorFunctionality";
import { addDropperFunctionality } from "ReplicatedStorage/Utility/ItemFunctionality/DropperFunctionality";
import { Option } from "@rbxts/rust-classes";
import { $env } from "rbxts-transform-env"
import { User } from "./User";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";

type UnwrapLuaTuple <T> = T extends LuaTuple<infer U> ? U : never
type CFrameComponents = UnwrapLuaTuple<ReturnType<CFrame["GetComponents"]>>

export interface ItemData {
	user: number,
	cframe: CFrameComponents,
	enabled: boolean,
	registerID: string,
	instanceID: string,
}


/**
 * The `Item` class is a representation of an 'active' item *instance*.
 *
 * An 'active' item is one that is not 'in storage', where such a thing is represented merely as a count in an inventory.
 *
 * The `Item` class should not be confused with an Item**Register**, which defines the behavior of an `Item`.
 *
 * @see {@link ItemRegister `ItemRegister`}
 *
 * ---
 *
 * The same remarks regarding mutation and persistance on the {@link User `User`} class apply here.
 *
 * Of note is the fact that items are actually stored on a {@link User `User`} class itself, but this does effect how things are done in a major manner.
 *
 * @see {@link User `User`}
 * @see {@link ItemRepository `ItemRepository`}
 */
export class Item <
	T extends ItemTrait = ItemTrait,
	U extends ItemTraitEnum[] = ItemTraitEnum[]
> implements Serializable<ItemData> {
	// #region Trait Narrow Methods
	static isConveyor <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): item is Item<T & ItemTrait<ItemTraitEnum.CONVEYOR>> { return item.register.traits.includes(ItemTraitEnum.CONVEYOR); }
	static isUpgrader <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): item is Item<T & ItemTrait<ItemTraitEnum.UPGRADER>> { return item.register.traits.includes(ItemTraitEnum.UPGRADER); }
	static isDropper <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): item is Item<T & ItemTrait<ItemTraitEnum.DROPPER>> { return item.register.traits.includes(ItemTraitEnum.DROPPER); }
	static isFurnace <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): item is Item<T & ItemTrait<ItemTraitEnum.FURNACE>> { return item.register.traits.includes(ItemTraitEnum.FURNACE); }
	// #endregion Trait Narrow Methods
	// #region Trait Assertion Methods
	static assertIsConveyor <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): asserts item is Item<T & ItemTrait<ItemTraitEnum.CONVEYOR>> { if ($env<boolean>("PRODUCTION")) { return } else { assert(Item.isConveyor(item)) } }
	static assertIsUpgrader <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): asserts item is Item<T & ItemTrait<ItemTraitEnum.UPGRADER>> { if ($env<boolean>("PRODUCTION")) { return } else { assert(Item.isUpgrader(item)) } }
	static assertIsDropper <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): asserts item is Item<T & ItemTrait<ItemTraitEnum.DROPPER>> { if ($env<boolean>("PRODUCTION")) { return } else { assert(Item.isDropper(item)) } }
	static assertIsFurnace <T extends ItemTrait<ItemTraitEnum>> (item: Item<T>): asserts item is Item<T & ItemTrait<ItemTraitEnum.FURNACE>> { if ($env<boolean>("PRODUCTION")) { return } else { assert(Item.isFurnace(item)) } }
	// #endregion Trait Assertion Methods

	/**
	 * Item's `ItemRegister`.
	 *
	 * @see {@link ItemRegister `ItemRegister`}
	 */
	public register: ItemRegister<U, T>;

	/**
	 * Looping timer used for functionality of the item.
	 */
	public timer?: Timer;

	/**
	 * Whether or not to have functionality.
	 */
	public enabled = true

	/**
	 * The model of the item.
	 *
	 * This is usually defined, but when an item is collected by a user
	 * and a reference is still held by an ore, it will be undefined.
	 */
	public model: Model;

	/**
	 * The amount of loose and active ores that this dropper has dropped.
	 */
	public ores!: T extends Dropper ? Set<Ore> : undefined

	constructor (
		/** Possessor of the item. */
		public readonly user: User,
		/** Register Identifier (UUID) */ public readonly registerID: string,
		/** Instance Identifier (UUID) */ public readonly instanceID: string = HttpService.GenerateGUID(false),
	) {
		if (user.inventory.items[this.registerID]) error();
		this.register = ItemRegistry[this.registerID as keyof typeof ItemRegistry] as never;
		if (Item.isDropper(this)) this.ores = new Set() as T extends Dropper ? Set<Ore> : undefined;
		const name = `${registerID}|${instanceID}`;
		this.model = game.Workspace.FindFirstChild(name) as Model || this.register.model.Clone();
		this.model.SetAttribute("InstanceID", this.instanceID);
		this.model.SetAttribute("ItemID", this.registerID);
		this.model.Parent = game.Workspace;
		this.model.Name = name;
		this.timer = this.register.timer?.()

		// This isn't a security issue if a check like this is bypassed on the client, as the server is still the source of truth. 
		// This is just a way of preventing unnecessary computation on the client by calculating physics on both ends.
		if (!user.inventory.items[this.instanceID] && RunService.IsServer()) {
			if (Item.isDropper(this))  addDropperFunctionality(this, Item);
			if (Item.isConveyor(this)) addConveyorFunctionality(this, Item);
		}

		user.inventory.items[this.instanceID] = this;
	}

	/**
	 * Recursively sets the collision state of all applicable parts on this item's model.
	 * @param enabled Whether or not to enable collision.
	 * @remarks
	 *  - This keeps track of the collision state prior to this being called so that
	 *    the state can be restored upon calling `setCollision` again. (Ex: upgrader bars should always remain no-collide)
	 */
	public setCollision (enabled: boolean) {
		if (enabled === false) {
			this.model.GetDescendants().forEach((part) => {
				if (!part.IsA("BasePart")) return;
				if (part.GetAttribute("PreviousCollisionState") === undefined) {
					part.SetAttribute("PreviousCollisionState", part.CanCollide ? 1 : 0);
				}
				part.CanCollide = enabled;
			})
		} else {
			this.model.GetDescendants().forEach((part) => {
				if (!part.IsA("BasePart")) return;
				part.CanCollide = part.GetAttribute("PreviousCollisionState") === undefined ? enabled : part.GetAttribute("PreviousCollisionState") === 1
				part.SetAttribute("PreviousCollisionState", undefined);
			})
		}
	}

	private pickupDisplayLoopConnection: Option<RBXScriptConnection> = Option.none()

	/**
	 * Sets the display off pickup animation.
	 * @param enabled - What state to toggle to.
	 */
	public showPickup (enabled: boolean) {
		const pickupAffected = this.model.GetDescendants().filter((part) => CollectionService.HasTag(part, Tag.DisplayOnPickup))

		if (enabled === false) {
			this.pickupDisplayLoopConnection.expect("tried to disable pickup effects on item without any!").Disconnect();
			this.pickupDisplayLoopConnection = Option.none()

			pickupAffected.forEach((part) => {
				if (!part.IsA("Part") && !part.IsA("Texture")) return;
				const tween = TweenService.Create(part, new TweenInfo(0.25), { Transparency: 1 })
				tween.Play();
				tween.Completed.Connect(() => {
					tween.Destroy();
				})
			})
		} else {
			pickupAffected.forEach((part) => {
				if (!part.IsA("Part") && !part.IsA("Texture")) return;
				const tween = TweenService.Create(part, new TweenInfo(0.25), { Transparency: 0 })
				tween.Play();
				tween.Completed.Connect(() => {
					tween.Destroy();
				})
			})

			this.pickupDisplayLoopConnection = Option.some(RunService.Heartbeat.Connect(() => {
				pickupAffected.forEach((part) => {
					if (part.IsA("Texture")) {
						part.OffsetStudsU += part.GetAttribute("OffsetStudsGrowthU") as number ?? 0
						part.OffsetStudsV += part.GetAttribute("OffsetStudsGrowthV") as number ?? 0
					}
				})
			}))
		}
	}

	//#region Serde, Mut
	public Serialize (): ItemData {
		return {
			user: this.user.player.UserId,
			cframe: this.model.GetPivot().GetComponents(),
			enabled: this.enabled,
			registerID: this.registerID,
			instanceID: this.instanceID,
		}
	}

	/**
	 * Overrides data with given data.
	 * Does not modify item owner.
	 */
	public update (data: ItemData) {
		this.enabled = data.enabled;
		this.model.PivotTo(new CFrame(...data.cframe));

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.registerID = data.registerID;
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		this.instanceID = data.instanceID;

		return this;
	}

	public static Deserialize (owner: User, data: ItemData): Item {
		const item = new Item(owner, data.registerID, data.instanceID);
		item.enabled = data.enabled;
		item.model.PivotTo(new CFrame(...data.cframe))
		return item;
	}
	//#endregion Serde, Mut
}

import type { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ReplicatedStorage } from "@rbxts/services";
import { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { Timer } from "@rbxts/timer";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

const Models: Record<string, Model> = {}
// #region Initial model collection.
const workspaceChildren = game.Workspace.GetChildren();
const replicatedModels = ReplicatedStorage.FindFirstChild("Models")!.FindFirstChild("Tycoon")!.GetChildren() as Model[];
for (const model of replicatedModels)  { model.GetAttribute("ItemID") !== undefined && (Models[model.GetAttribute("ItemID") as string] = model as Model) }
for (const model of workspaceChildren) { model.GetAttribute("ItemID") !== undefined && (Models[model.GetAttribute("ItemID") as string] = model as Model) }
// #endregion Initial model collection.

/**
 * An `ItemRegister` is a constant definition for the behavior of an item.
 *
 * This approach is used because it allows us to have varying behaviors
 * without having a massive conditional or creating seperate classes
 * for each item, which would cause complications and just be inconvenient to use.
 *
 * By having things here be context-based generators/getters, we
 * can have dynamic behavior without having to store state
 * beyond what is already on the user or potential item instance itself.
 */
export type ItemRegister <T extends ItemTraitEnum[], U extends ItemTrait> = ItemRegisterProvided<U> & ItemRegisterAssigned<T>
export function RegisterItem <T extends ItemTraitEnum[] | []> (traits: T, id: string, register: T extends [] ? ItemRegisterProvided<{}> : ItemRegisterProvided<ItemTrait<T[number]>>): typeof register & ItemRegisterAssigned<T> {
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).traits = traits;
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).model = Models[id];
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).id = id;
	return register as typeof register & ItemRegisterAssigned<T>;
}

type ItemRegisterAssigned <T extends ItemTraitEnum[]> = {
	/**
	 * Constant unique identifier for this item register.
	 */
	readonly id: string;
	/**
	 * Assigned traits of the item for runtime testing of trait capacity.
	 */
	readonly traits: T,
	/**
	 * Model of the item.
	 *
	 * @remarks
	 *  - This will be soon be adjusted to allow for multiple models per register depending on context.
	 *  - This should not be used directly, and should instead be cloned before any form of usage beyond reading.
	 */
	readonly model: Model
}

type ItemRegisterProvided <T extends ItemTrait | {} = {}> = (T extends undefined ? {} : T extends never ? {} : T) & {
	/**
	 * Pricing for this item.
	 *
	 * If a price is omitted, it cannot be bought.
	 * If a section is omitted, it cannot be sold/bought (dependant on the omitted section).
	 */
	readonly price: Partial<Record<ExchangeType, Partial<Record<Currency, number>>>>
	/**
	 * The display name of the item.
	 */
	readonly name: string;
	/**
	 * A function to return a new timer, used as the internal
	 * clock for an item and as a source of randomness.
	 */
	readonly timer?: () => Timer,
}



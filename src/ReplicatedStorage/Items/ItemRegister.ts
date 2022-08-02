import type { Currency } from "ReplicatedStorage/Enums/Currency";
import type { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";
import type { ItemTrait, ItemTraitEnum } from "./ItemTrait";

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
 *
 */
export type ItemRegister <T extends ItemTraitEnum[], U extends ItemTrait> = ItemRegisterProvided<U> & ItemRegisterAssigned<T>;
export function RegisterItem <T extends ItemTraitEnum[] | []> (traits: T, source: LuaSourceContainer, register: T extends [] ? ItemRegisterProvided<{}> : ItemRegisterProvided<ItemTrait<T[number]>>): typeof register & ItemRegisterAssigned<T> {
	assert(source.IsA("ModuleScript"), `item registration must occur in a ModuleScript! (name: ${source.Name})`);
	assert(source.Parent, `item registration file must have a non-nil parent! (id: ${source.Name})`);
	const model = source.Parent.FindFirstChildOfClass("Model");
	assert(model, `item must have an assosciated model (id: ${source.Name})`);
	// Fill in the register with the provided info.
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).traits = traits;
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).model = model;
	(register as typeof register & Writable<ItemRegisterAssigned<T>>).id = model.Name;
	return register as typeof register & ItemRegisterAssigned<T>;
}

/**
 * Properties that are assigned to the register.
 */
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
};

type ItemRegisterProvided <T extends ItemTrait | {} = {}> = (T extends undefined ? {} : T extends never ? {} : T) & {
	/**
	 * The display name of the item.
	 */
	readonly name: string;
	/**
	 * Pricing of the item, to sell and to purchase, in various currencies.
	 * If a category is omitted (selling or purchasing), it cannot be sold/purchased (dependant on what is omitted)
	 * If a currency is omitted, it cannot be bought/sold with said currency in the category it was omitted from
	 */
	readonly price: Partial<Record<PricingExchangeType, Partial<Record<Currency, number>>>>
	/**
	 * The asset ID for an icon to be displayed in a GUI. If not provided, a fallback of the model's name will be used.
	 */
	readonly icon?: string;
};

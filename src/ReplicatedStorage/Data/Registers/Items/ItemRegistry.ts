import type { ItemTrait, ItemTraitEnum } from "./ItemTrait";
import type { ItemRegister } from "./ItemRegister";
import { ReplicatedStorage } from "@rbxts/services";

/**
 * An array of all ItemRegisters.
 *
 * This was done because Roact is wacky and when we try to collect the pairs of `ItemRegistry`'s values into an array it decides to error and not work.
 * By always having an array, it makes iteration much easier and we don't need to rebuilt it in a different scope every time.
 */
export const ItemRegisterList: ItemRegister<ItemTraitEnum[], ItemTrait>[] = [];
export const ItemRegistry = ReplicatedStorage
	.WaitForChild("TS")!
	.WaitForChild("Data")!
	.WaitForChild("Registers")!
	.WaitForChild("Items")
	.WaitForChild("Registers")!
	.GetChildren()
	.map((child) => {
		if (!child.IsA("ModuleScript")) throw "Item registry child must be a module script!";
		const register = require(child) as ItemRegister<ItemTraitEnum[], ItemTrait>;
		return [register.id, register] as const;
	}).reduce((acc, [id, register]) => {
		if (acc[id]) throw `Duplicate item registry id: ${id}`;
		acc[id] = register;
		ItemRegisterList.push(register);
		return acc;
	}, {} as { [id: string]: ItemRegister<ItemTraitEnum[], ItemTrait> });

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
	.WaitForChild("Items")!
	.GetChildren()
	.filter((descendant): descendant is Folder => descendant.IsA("Folder"))
	.map((descendant) => descendant.GetChildren())
	.reduce((arr, instance) => { instance.forEach((instance) => arr.push(instance)); return arr; }, [] as Instance[])
	.filter((descendant): descendant is ModuleScript => descendant.IsA("ModuleScript"))
	.map((descendant) => require(descendant) as ItemRegister<ItemTraitEnum[], ItemTrait>)
	.map((register) => [register.id, register] as const)
	.sort((a, b) => (
		a[0].byte().reduce((v, b, i) => v + (b * 10**i), 0) >
		b[0].byte().reduce((v, b, i) => v + (b * 10**i), 0)
	))
	.reduce((acc, [id, register]) => {
		if (acc[id]) throw `Duplicate item registry id: ${id}`;
		acc[id] = register;
		ItemRegisterList.push(register);
		return acc;
	}, {} as { [id: string]: ItemRegister<ItemTraitEnum[], ItemTrait> });

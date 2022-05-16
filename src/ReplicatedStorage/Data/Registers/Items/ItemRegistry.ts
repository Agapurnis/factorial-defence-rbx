import type { ItemTrait, ItemTraitEnum } from "./ItemTrait";
import type { ItemRegister } from "./ItemRegister";
import { ReplicatedStorage } from "@rbxts/services";

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

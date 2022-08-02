import { Service } from "@flamework/core";
import type { OreService } from "ServerScriptService/Services/OreService";
import type { Components } from "@flamework/components";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import { CollectionService } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { OreComponent } from "ReplicatedStorage/Components/Ore";

@Service()
class UpgraderService {
	constructor (
		private readonly Components: Components,
		private readonly OreService: OreService,
	) {
		CollectionService.GetInstanceAddedSignal(CollectionTag.UPGRADER).Connect((instance) => {
			task.defer(() => {
				assert(instance.IsA("BasePart"), "instance was must be a `BasePart`!");

				// We defer to allow Flamework to have enough to time initialize the component.
				const item = this.Components.getComponent<ItemComponent<ItemTrait<ItemTraitEnum.UPGRADER>>>(instance.FindFirstAncestorOfClass("Model")!);
				assert(item, "item did not initialize in time!");
				assert(item.HasTrait(ItemTraitEnum.UPGRADER), "item lacks the upgrader trait but has a upgrader tagged part!");

				// Ensure the upgrader functions as an upgrader.
				instance.Touched.Connect((instance) => {
					const ore = this.OreService.GetOreFromPart(instance);
					if (ore.isSome()) item.Register.upgrade(ore.unwrap(), item);
				});
			});
		});
	}
}

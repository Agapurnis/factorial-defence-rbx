import { Service } from "@flamework/core";
import type { OreService } from "ServerScriptService/Services/OreService";
import type { Components } from "@flamework/components";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import { CollectionService } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";

@Service()
class FurnaceService {
	constructor (
		private readonly Components: Components,
		private readonly OreService: OreService,
	) {
		CollectionService.GetInstanceAddedSignal(CollectionTag.FURNACE).Connect((instance) => {
			task.defer(() => {
				assert(instance.IsA("BasePart"), "instance was must be a `BasePart`!");

				// We defer to allow Flamework to have enough to time initialize the component.
				const item = this.Components.getComponent<ItemComponent<ItemTrait<ItemTraitEnum.FURNACE>>>(instance.FindFirstAncestorOfClass("Model")!);
				assert(item, "item did not initialize in time!");
				assert(item.HasTrait(ItemTraitEnum.FURNACE), "item lacks the furnace trait but has a furnace tagged part!");

				// Ensure the upgrader functions as an upgrader.
				instance.Touched.Connect((instance) => {
					const oreResult = this.OreService.GetOreFromPart(instance);
					if (oreResult.isSome()) {
						const ore = oreResult.unwrap();
						if (!ore.Enabled) return;
						if (!item.Enabled) return;
						item.Register.sell(ore, item);
						this.OreService.FadeOre(ore);
					}
				});
			});
		});
	}
}

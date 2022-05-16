import type { Item } from "ReplicatedStorage/Classes/Item";
import { CollectionService } from "@rbxts/services";
import type { Conveyor } from "ReplicatedStorage/Data/Registers/Items/Traits/Conveyor";
import type { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";

/**
 * Adds basic functionality to a conveyor item.
 *
 * - Ensures `AssemblyLinearVelocity` is applied to the conveyor based on the item's speed (from it's register), and updates it whenever the orientation or cframe is adjusted.
 *
 * @param item - The item to add functionality to.
 * @param _Item - The `Item` class constructor, used to assert that the item is a conveyor. This is injected to prevent cyclic dependencies.
 */
export function addConveyorFunctionality (item: Item<Conveyor & (Dropper | {})>, _Item: typeof Item) {
	_Item.assertIsConveyor(item);

	item.model.GetDescendants().forEach((part) => {
		if (!part.IsA("BasePart")) return;
		if (CollectionService.HasTag(part, Tag.Conveyor)) {
			const ats = part.WaitForChild("Start") as Attachment;
			const ate = part.WaitForChild("End")   as Attachment;

			const update = () => {
				const direction = ate.WorldPosition.sub(ats.WorldPosition);
				const velocity = direction.Unit.mul(item.register.speed);
				part.AssemblyLinearVelocity = velocity;
			};

			part.GetPropertyChangedSignal("CFrame").Connect(update);

			update();
		}
	});
}

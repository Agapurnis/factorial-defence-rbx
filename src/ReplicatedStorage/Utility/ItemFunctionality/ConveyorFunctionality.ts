import type { Item } from "ReplicatedStorage/Classes/Item";
import { CollectionService } from "@rbxts/services";
import type { Conveyor } from "ReplicatedStorage/Data/Registers/Items/Traits/Conveyor";
import type { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";

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

import { Service } from "@flamework/core";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import type { Components } from "@flamework/components";
import { CollectionService } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";

@Service()
class ConveyorService {
	constructor (private readonly components: Components) {
		CollectionService.GetInstanceAddedSignal(CollectionTag.CONVEYOR).Connect((instance) => {
			task.defer(() => {
				assert(instance.IsA("BasePart"), "instance was must be a `BasePart`!");

				// We defer to allow Flamework to have enough to time initialize the component.
				const component = this.components.getComponent<ItemComponent<ItemTrait<ItemTraitEnum.CONVEYOR>>>(instance.FindFirstAncestorOfClass("Model")!);
				assert(component, "component did not initialize in time!");
				assert(component.HasTrait(ItemTraitEnum.CONVEYOR), "component lacks the conveyor trait but has a conveyor tagged part!");

				// Extracting to a constant because we lose the narrowing in the callbacks :(
				const RegisterDetails = component.Register;

				// Ensure the conveyor functions as a conveyor.
				const ats = instance.WaitForChild("Start") as Attachment;
				const ate = instance.WaitForChild("End")   as Attachment;

				assert(ats, "conveyor has no start attachment!");
				assert(ate, "conveyor has no end attachment!");

				const update = () => {
					const direction = ate.WorldPosition.sub(ats.WorldPosition);
					const velocity = direction.Unit.mul(RegisterDetails.speed);
					instance.AssemblyLinearVelocity = velocity;
				};

				component.maid.GiveTask(
					instance.GetPropertyChangedSignal("CFrame").Connect(update)
				);

				update();
			});
		});
	}
}

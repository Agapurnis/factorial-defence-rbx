import { Service } from "@flamework/core";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import type { Components } from "@flamework/components";
import { CollectionService } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { Timer } from "@rbxts/timer";

@Service()
class DropperService {
	constructor (private readonly components: Components) {
		CollectionService.GetInstanceAddedSignal(CollectionTag.DROPPER).Connect((instance) => {
			task.defer(() => {
				// We defer to allow Flamework to have enough to time initialize the component.
				const component = this.components.getComponent<ItemComponent<ItemTrait<ItemTraitEnum.DROPPER>>>(instance.FindFirstAncestorOfClass("Model")!);
				assert(component, "component did not initialize in time!");
				assert(component.HasTrait(ItemTraitEnum.DROPPER), "component lacks the dropper trait but has a dropper tagged part!");

				// Extracting to a constant because we lose the narrowing in the callbacks :(
				const RegisterDetails = component.Register;

				// Ensure the dropper functions as a dropper.
				let connection: RBXScriptConnection;
				let timer: Timer;

				function dropLoop () {
					timer = new Timer(RegisterDetails.dropSpeed / 1000);

					connection = timer.completed.Connect(() => {
						connection!.Disconnect();

						if (!component || !component.instance || component.instance.Parent === undefined) {
							// The component was destroyed.
							// Don't restart the loop.
							return;
						}

						// TODO: Does this affect the call-stack negatively?
						/// I left it running for a few hours and didn't notice anything so it's *probably* okay, but it'd be nice to double-check.
						dropLoop();
					});

					if (component && component.Enabled && component.instance && component.instance.Parent !== undefined) {
						RegisterDetails.drop(component);
					}

					timer.start();
				}

				dropLoop();
			});
		});
	}
}

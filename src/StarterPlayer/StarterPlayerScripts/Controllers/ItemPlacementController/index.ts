import type { ItemSelectionEffectController} from "./ItemSelectionEffectController";
import type { ItemSelectionController } from "./ItemSelectionController";
import type { ItemMovementController } from "./ItemMovementController";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { Components } from "@flamework/components";
import { Players, UserInputService, ContextActionService, Workspace } from "@rbxts/services";
import { HighlightStyle } from "./ItemSelectionEffectController";
import { Controller } from "@flamework/core";
import { Option } from "@rbxts/rust-classes";
import Remotes from "ReplicatedStorage/Networking";

const enum ItemInteractionContextActionServiceBindingName {
	SelectItem = "SelectItem",
	HoverItem = "HoverItem",
	MoveItem = "MoveItem",
}

@Controller()
export class ItemPlacementController {
	private readonly camera = Workspace.CurrentCamera;
	private readonly mouse = Players.LocalPlayer.GetMouse();

	/**
	 * Sets whether or not the bindings that allow the user to select items are active or not.
	 */
	private SetCanSelect (state: boolean) {
		// We always want to unbind regardless of the new state so we don't end up having multiple actions bound.
		ContextActionService.UnbindAction(ItemInteractionContextActionServiceBindingName.SelectItem);
		// But whether or not we re-enable the action is dependant upon the new state as provided by the caller.
		if (state) ContextActionService.BindAction(ItemInteractionContextActionServiceBindingName.SelectItem, this.SelectItemAction, false, Enum.UserInputType.MouseButton1, Enum.UserInputType.Touch);
	}

	/**
	 * Sets whether or not the bindings that allow the user to hover over items are active or not.
	 *
	 * Obviously, the user can move their input device and hover over items regardless of this setting, but this controls the visual effects.
	 */
	private SetCanHover (state: boolean) {
		// We always want to unbind regardless of the new state so we don't end up having multiple actions bound.
		ContextActionService.UnbindAction(ItemInteractionContextActionServiceBindingName.HoverItem);
		// But whether or not we re-enable the action is dependant upon the new state as provided by the caller.
		if (state) ContextActionService.BindAction(ItemInteractionContextActionServiceBindingName.HoverItem, this.HoverItemAction, false, Enum.UserInputType.MouseMovement);
	}

	/**
	 * Sets whether or not the bindings that allow the user to interact with items are active or not.
	 *
	 * An interaction, in this case, would be moving an item.
	 */
	private SetCanInteract (state: boolean) {
		// We always want to unbind regardless of the new state so we don't end up having multiple actions bound.
		ContextActionService.UnbindAction(ItemInteractionContextActionServiceBindingName.MoveItem);
		// But whether or not we re-enable the action is dependant upon the new state as provided by the caller.
		if (state) ContextActionService.BindAction(ItemInteractionContextActionServiceBindingName.MoveItem, this.MoveItemAction, false, Enum.KeyCode.X);
	}

	private readonly MoveItemAction: Parameters<ContextActionService["BindAction"]>[1] = (action, state, input) => {
		// We only care about the start of the input.
		if (state === Enum.UserInputState.End) return;

		// Store the initial position of each item prior to movement so it can be reverted in the event of an issue without any client-server desynchronization.
		const PositionsPriorToMovement = this.ItemSelectionController.GetSelected().reduce((map, item) => { map.set(item, item.instance.GetPivot()); return map; }, new Map<ItemComponent, CFrame>());

		// Make it so we can move items.
		this.ItemMovementController.Setup();
		this.ItemMovementController.ActivateMovementMode();

		this.SetCanSelect(false);
		this.SetCanInteract(false);

		this.ItemSelectionController.GetSelected().forEach((item) => {
			// Notify the server we are moving the items to disable their functionality.
			Remotes.StartMovingItems.Invoke([item.attributes.ItemInstanceUUID]);
			// Display the visual effects and prevent anything from colliding with the item.
			this.ItemSelectionEffectController.SetPickupEffect(item, true);
			this.ItemSelectionEffectController.SetCollision(item, false);
		});

		// Consider the items placed when the next mouse click happens.
		const AwaitingMouseClickConnection = UserInputService.InputEnded.Connect((event) => {
			if (event.UserInputType !== Enum.UserInputType.MouseButton1) return;

			const Movable = this.ItemSelectionController.GetSelected().filter((item) => !item.IsColliding());

			// Store the position of each item prior to placement so we can bypass the server's position update to tween it in a prettier way.
			const PositionsPriorToPlacement = this.ItemSelectionController.GetSelected().reduce((map, item) => { map.set(item, item.instance.GetPivot()); return map; }, new Map<ItemComponent, CFrame>());

			Remotes.PlaceItems.Invoke(
				Movable.map((item) => [
					item.attributes.ItemInstanceUUID,
					item.instance.GetPivot()
				])
			).forEach((result, index) => {
				const item = Movable[index];

				// Immediately revert the movement so that we can do our own tweened movement.
				// This unfortunately still has a bit of a jitter. :(
				item.instance.PivotTo(PositionsPriorToPlacement.get(item)!);

				if (result.isErr()) {
					warn(`Failed to move item '${item.attributes.ItemInstanceUUID}', attempting to revert to previous position.`);
					// We didn't actually end up moving this item due to a small collision desynchronization issue between the server and client.
					// The best choice would be to move attempt to move the item on the client back to it's previous position, without deselecting it.
					const fallback = Remotes.PlaceItems.Invoke([[item.attributes.ItemInstanceUUID, PositionsPriorToMovement.get(item)!]])[0];
					// If that didn't end up working, just keep it in a movement state.
					if (fallback.isErr()) return;
				}

				// Disable the item and disable it's various effects.
				this.ItemSelectionController.Deselect(item);
				this.ItemSelectionEffectController.SetCollision(item, true);
				this.ItemSelectionEffectController.SetPickupEffect(item, false);

				// Use the position that was returned from us, since we may have ended up slightly moving the item on the client.
				// This would cause a mismatch/slight desynchronization between how the client see slights, abnd may cause the appearance of a possible collision.
				// In the event that the request actually failed, return the item to it's previous position.
				this.ItemMovementController.ManuallyMoveItem(item, 0.25, result.unwrapOr(PositionsPriorToMovement.get(item)!));
			});

			if (this.ItemSelectionController.GetSelected().size() === 0) {
				AwaitingMouseClickConnection.Disconnect();
				this.ItemMovementController.DeactivateMovementMode();
				this.TryHoverItemOverCursor();
				this.SetCanSelect(true);
				this.SetCanHover(true);
			}
		});
	};

	private readonly HoverItemAction: Parameters<ContextActionService["BindAction"]>[1] = (action, state, input) => {
		this.TryHoverItemOverCursor();
	};

	/**
	 * The action that occurs when one is going to select an item by clicking (or releasing a click).
	 *
	 * @param action The identifier for the action that was triggered.
	 * @param state The current state of the input (whether it is starting or ending).
	 * @param input The input that was triggered.
	 */
	private readonly SelectItemAction: Parameters<ContextActionService["BindAction"]>[1] = (action, state, input) => {
		if (state === Enum.UserInputState.Begin) {
			const item = this.GetItemOverCursor();
			const shift = false
				|| UserInputService.IsKeyDown(Enum.KeyCode.LeftShift)
				|| UserInputService.IsKeyDown(Enum.KeyCode.RightShift);

			if (item.isSome()) {
				// You shouldn't be able to do anything with other player's items.
				// Don't worry, this is validated on the server too! :)
				if (item.unwrap().Owner.instance.UserId !== Players.LocalPlayer.UserId) return;
			}

			if (item.isSome() && shift) {
				// Toggle the selection status of the item.
				if (this.ItemSelectionController.IsSelected(item.unwrap())) {
					this.ItemSelectionController.Deselect(item.unwrap());
					// A sudden deselection means the item is no longer parented to the selection group model which has it's transformations being applied.
					// To ensure the item doesn't get stuck in an invalid position on the client, manually move it.
					this.ItemMovementController.ManuallyMoveItem(item.unwrap());
				} else {
					this.ItemSelectionController.Select(item.unwrap());
				}

				// If one or more items are still selected, allow interaction.
				if (this.ItemSelectionController.GetSelected().size() > 0) {
					this.SetCanInteract(true);
				} else {
					this.SetCanInteract(false);
				}

				// Don't continue execution if the item is now deselected, as it could have unintended side-effects.
				if (!this.ItemSelectionController.IsSelected(item.unwrap())) return;
			}

			if (shift || this.ItemSelectionController.GetSelected().size() === 0) {
				this.ItemSelectionController.BeginSelecting();
			} else {
				this.ItemSelectionController.DeselectAll().forEach((item) => {
					// A sudden deselection means the item is no longer parented to the selection group model which has it's transformations being applied.
					// To ensure the item doesn't get stuck in an invalid position on the client, manually move it.
					this.ItemMovementController.ManuallyMoveItem(item);
				});

				// If we clicked off our selection onto another item, make that our only new selection.
				if (item.isSome() && !this.ItemSelectionController.IsSelected(item.unwrap())) {
					this.ItemSelectionController.Select(item.unwrap());
				}
			}
		}

		if (state === Enum.UserInputState.End) {
			this.ItemSelectionController.StopSelecting();

			if (this.ItemSelectionController.GetSelected().size() > 0) {
				this.SetCanInteract(true);
			} else {
				this.TryHoverItemOverCursor();
			}
		}
	};

	/**
	 * Returns the `ItemComponent` that the mouse is hovering over, if it exists.
	 */
	public GetItemOverCursor (): Option<ItemComponent> {
		const target = this.mouse.Target;

		if (target === undefined) return Option.none<ItemComponent>();

		const ascendToItem = (instance: Instance): ItemComponent | undefined => {
			const item = this.Components.getComponent<ItemComponent>(instance);
			const parent = instance.FindFirstAncestorWhichIsA("Model");
			return item ? item : parent ? ascendToItem(parent) : parent;
		};

		return Option.wrap<ItemComponent>(ascendToItem(target));
	}

	private PreviouslyHoveredItem = Option.none<ItemComponent>();
	private TryHoverItemOverCursor () {
		const item = this.GetItemOverCursor();

		if (
			item.map((item) => {
				return item.Owner.instance.UserId === Players.LocalPlayer.UserId &&
				!this.ItemSelectionController.IsSelected(item);
			}).unwrapOr(false)
		) {
			this.ItemSelectionEffectController.SetHighlight(item.unwrap(), HighlightStyle.HOVERING);
		} else if (
			this.PreviouslyHoveredItem.filter((item) => !this.ItemSelectionController.IsSelected(item)).map(() => true).unwrapOr(false)
		) {
			this.ItemSelectionEffectController.SetHighlight(this.PreviouslyHoveredItem.unwrap(), HighlightStyle.NONE);
		}

		this.PreviouslyHoveredItem = item;
	}

	constructor (
		private readonly ItemSelectionController: ItemSelectionController,
		private readonly ItemSelectionEffectController: ItemSelectionEffectController,
		private readonly ItemMovementController: ItemMovementController,
		private readonly Components: Components,
	) {
		assert(this.camera, "Expected a camera to exist.");

		this.SetCanHover(true);
		this.SetCanSelect(true);
	}
}

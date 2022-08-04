import type { ItemSelectionEffectController} from "./ItemSelectionEffectController";
import type { ItemPlacementController } from ".";
import type { ItemMovementController } from "./ItemMovementController";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import { Controller, Dependency } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { SelectionBoxStyle } from "./ItemSelectionEffectController";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { Option } from "@rbxts/rust-classes";

const SelectedItemsContainerModel = new Instance("Model");
SelectedItemsContainerModel.Name = "SelectedItemsContainerModel";
SelectedItemsContainerModel.Parent = Workspace;

@Controller()
export class ItemSelectionController {
	/**
	 * The identifier for the bound selection action used in `ContextActionService`.
	 */
	public static readonly SELECTION_ACTION_NAME = "ItemSelect";

	/**
	 * The `ComplexRegion`s for each selected item.
	 */
	public readonly ItemComplexRegions = new Map<ItemComponent, ComplexRegion>();

	/**
	 * The controller for various selection effects on an item.
	 */
	private readonly ItemSelectionBoxController = Dependency<ItemSelectionEffectController>();

	/**
	 * The model that will contain all of the selected items.
	 */
	public readonly SelectedItemsContainerModel = SelectedItemsContainerModel;

	/**
	 * All of the selected items, in order.
	 */
	private readonly Selected: ItemComponent[] = [];

	/**
	 * The mouse, used to find where the user is hovering over to select the relevant item.
	 */
	private readonly mouse = Players.LocalPlayer.GetMouse();

	/**
	 * Whether or not to begin selecting items when MB1 is pressed.
	 */
	public ShouldActiveOnButtonPress = true;

	/**
	 * Toggles whether or not the provided item is selected, returning it's new toggled state.
	 */
	public ToggleSelected (item: ItemComponent): boolean {
		const IsSelected = this.Selected.includes(item);

		if (IsSelected) {
			this.Deselect(item);
		} else {
			this.Select(item);
		}

		return !IsSelected;
	}

	/**
	 * Returns an array containing all of the selected items.
	 */
	public GetSelected (): ItemComponent[] {
		// Return a clone to prevent the caller from modifying the array.
		return [...this.Selected];
	}

	/**
	 * Returns whether or not the provided item is selected.
	 */
	public IsSelected (item: ItemComponent): boolean {
		return this.Selected.includes(item);
	}

	/**
	 * Selects the item.
	 */
	public Select (item: ItemComponent): void {
		// If it's already selected, don't do anything.
		if (this.Selected.includes(item)) return;
		// Otherwise, select the item and such.
		this.SelectedItemsContainerModel.PrimaryPart = item.instance.PrimaryPart!;
		this.Selected.push(item);
		this.ItemSelectionBoxController.SetSelectionBox(item, SelectionBoxStyle.NORMAL);
		this.ItemComplexRegions.set(item, new ComplexRegion(item.instance, (part) => !(part.GetAttribute("DoesNotBlockPlacement") as boolean | undefined ?? false)));
		item.instance.Parent = this.SelectedItemsContainerModel;
	}

	/**
	 * Deselects the item.
	 */
	public Deselect (item: ItemComponent): void {
		this.ItemSelectionBoxController.RemoveSelectionBox(item);
		item.instance.Parent = Workspace;
		// Synchronize and manually tween the CFrame in case the deselection and reparenting occured during movement.
		Dependency<ItemMovementController>().ManuallyMoveItem(item);
		// Cleanup traces of this item being selected.
		this.Selected.remove(this.Selected.indexOf(item));
		this.SelectedItemsContainerModel.PrimaryPart = this.Selected[this.Selected.size()]?.instance?.PrimaryPart;
		this.ItemComplexRegions.delete(item);
	}

	/**
	 * Unselects all of the selected items.
	 */
	public DeselectAll (): void {
		this.GetSelected().forEach((selected) => {
			this.Deselect(selected);
		});
	}

	/**
	 * The connection to the event that selects stuff or whatever.
	 */
	private SelectionHookConnection: RBXScriptConnection | undefined;

	/**
	 * Attempts to select an item under the mouse.
	 *
	 * @returns The selected item, if it exists.
	 */
	private TrySelect (): Option<ItemComponent> {
		const item = Dependency<ItemPlacementController>().GetItemOverCursor();
		// You shouldn't be able to do anything with other player's items.
		// Don't worry, this is validated on the server too! :)
		if (item.isSome() && item.unwrap().Owner.instance.UserId !== Players.LocalPlayer.UserId) return Option.none();
		if (item.isSome()) this.Select(item.unwrap());
		return item;
	}

	/**
	 * Activates the selection mode.
	 */
	public ActivateSelectionMode (): void {
		if (!this.ShouldActiveOnButtonPress) return;

		// Before we have another connection, disgard the old one if it exists.
		this.SelectionHookConnection?.Disconnect();
		this.SelectionHookConnection = this.mouse.Move.Connect(() => this.TrySelect());

		// Try to select the item under the mouse so the user doesn't have to move the mouse for it to be registered.
		this.TrySelect();
	}

	/**
	 * Deactivates the selection mode.
	 */
	public DeactivateSelectionMode (): void {
		this.SelectionHookConnection?.Disconnect();
	}
}


import type { ItemSelectionEffectController} from "./ItemSelectionEffectController";
import type { ItemPlacementController } from ".";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import { Controller, Dependency } from "@flamework/core";
import { Players, Workspace } from "@rbxts/services";
import { HighlightStyle } from "./ItemSelectionEffectController";
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
	 * The controller for various selection effects on an item.
	 */
	private readonly ItemSelectionEffectController = Dependency<ItemSelectionEffectController>();

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
	 * Selects the item, returning it.
	 */
	public Select (item: ItemComponent): typeof item {
		// If it's already selected, don't do anything.
		if (this.Selected.includes(item)) return item;
		// Otherwise, select the item and give it it's visual effects.
		this.ItemSelectionEffectController.SetHighlight(item, HighlightStyle.SELECTED);
		this.SelectedItemsContainerModel.PrimaryPart = item.instance.PrimaryPart!;
		this.Selected.push(item);
		// Parent the item to the selection model transformer group.
		item.instance.Parent = this.SelectedItemsContainerModel;
		// Return the newly-selected item.
		return item;
	}

	/**
	 * Deselects the item, returning it.
	 */
	public Deselect (item: ItemComponent): typeof item {
		// Cleanup traces of this item being selected.
		this.Selected.remove(this.Selected.indexOf(item));
		this.SelectedItemsContainerModel.PrimaryPart = this.Selected[this.Selected.size()]?.instance?.PrimaryPart;
		this.ItemSelectionEffectController.SetHighlight(item, HighlightStyle.NONE);
		// Reparent the item so it is no longer in the selection model transformer group.
		item.instance.Parent = Workspace;
		// Return the now deselected item.
		return item;
	}

	/**
	 * Unselects all of the selected items, returning them.
	 */
	public DeselectAll (): ItemComponent[] {
		return this.GetSelected().map((selected) => {
			return this.Deselect(selected);
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
	 * Activates the selection mode, attempting to select every item the cursor moves over.
	 */
	public BeginSelecting (): void {
		// Before we have another connection, disgard the old one if it exists.
		this.SelectionHookConnection?.Disconnect();
		this.SelectionHookConnection = this.mouse.Move.Connect(() => this.TrySelect());

		// Try to select the item under the mouse so the user doesn't have to move the mouse for it to be registered.
		this.TrySelect();
	}

	/**
	 * Deactivates the selection mode.
	 */
	public StopSelecting (): void {
		this.SelectionHookConnection?.Disconnect();
	}
}


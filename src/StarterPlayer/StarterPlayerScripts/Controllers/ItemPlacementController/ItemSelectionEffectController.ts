import { Controller } from "@flamework/core";
import { Option } from "@rbxts/rust-classes";
import { CollectionService, RunService, TweenService } from "@rbxts/services";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";

export enum SelectionBoxStyle {
	ERROR,
	NORMAL,
}

@Controller()
export class ItemSelectionEffectController {
	private static readonly SELECTION_BOX_STYLE_TRANSPARENCY_SURFACE = 0.92;
	private static readonly SELECTION_BOX_STYLE_TRANSPARENCY_BORDER  = 0.8;
	private static readonly SELECTION_BOX_STYLE_COLOR_ERROR = Color3.fromRGB(214, 84, 84);
	private static readonly SELECTION_BOX_STYLE_COLOR_OKAY  = Color3.fromRGB(92, 125, 232);

	private readonly ItemSelectionBoxes = new Map<ItemComponent, [SelectionBox, SelectionBoxStyle]>();
	private readonly ItemPickupEffectConnections = new Map<ItemComponent, Option<RBXScriptConnection>>();

	/**
	 * Sets the display of pickup animation to the provided state on the provided item.
	 * @param enabled - What state to toggle to.
	 */
	public SetPickupEffect (item: ItemComponent, enabled: boolean): void {
		const DynamicInstances = item.instance.GetDescendants().filter((part) => CollectionService.HasTag(part, "DisplayOnPickup"));

		if (enabled === false) {
			this.ItemPickupEffectConnections.get(item)?.expect("tried to disable pickup effects on item without any!").Disconnect();
			this.ItemPickupEffectConnections.set(item, Option.none());

			DynamicInstances.forEach((part) => {
				if (!part.IsA("Part") && !part.IsA("Texture")) return;
				const tween = TweenService.Create(part, new TweenInfo(0.25), { Transparency: 1 });
				tween.Play();
				tween.Completed.Connect(() => {
					tween.Destroy();
				});
			});
		} else {
			DynamicInstances.forEach((part) => {
				if (!part.IsA("Part") && !part.IsA("Texture")) return;
				const tween = TweenService.Create(part, new TweenInfo(0.25), { Transparency: 0 });
				tween.Play();
				tween.Completed.Connect(() => {
					tween.Destroy();
				});
			});

			this.ItemPickupEffectConnections.set(item, Option.some(RunService.Heartbeat.Connect(() => {
				DynamicInstances.forEach((part) => {
					if (part.IsA("Texture")) {
						part.OffsetStudsU += part.GetAttribute("OffsetStudsGrowthU") as number ?? 0;
						part.OffsetStudsV += part.GetAttribute("OffsetStudsGrowthV") as number ?? 0;
					}
				});
			})));
		}
	}

	/**
	 * Recursively sets the collision state of all applicable parts on the provided item's model.
	 * @param enabled - What state to toggle to.
	 * @remarks
	 *  - This keeps track of the collision state prior to this being called so that the state can be restored upon calling `SetCollision` again. (EX: upgrader bars should always remain no-collide)
	 */
	public SetCollision (item: ItemComponent, enabled: boolean) {
		if (enabled === false) {
			item.instance.GetDescendants().forEach((part) => {
				if (!part.IsA("BasePart")) return;
				if (part.GetAttribute("PreviousCollisionState") === undefined) {
					part.SetAttribute("PreviousCollisionState", part.CanCollide ? 1 : 0);
				}
				part.CanCollide = enabled;
			});
		} else {
			item.instance.GetDescendants().forEach((part) => {
				if (!part.IsA("BasePart")) return;
				part.CanCollide = part.GetAttribute("PreviousCollisionState") === undefined ? enabled : part.GetAttribute("PreviousCollisionState") === 1;
				part.SetAttribute("PreviousCollisionState", undefined);
			});
		}
	}

	/**
	 * Adds a selection box to the provided item item, with the provided style (defaults to normal).
	 * If one already exists, it will be removed first.
	 */
	public SetSelectionBox (item: ItemComponent, style = SelectionBoxStyle.NORMAL): SelectionBox {
		// If a selection box already exists...
		if (this.ItemSelectionBoxes.has(item)) {
			const [oldBox, oldStyle] = this.ItemSelectionBoxes.get(item)!;
			if (style !== oldStyle) {
				// And it isn't the current style, then remove it.
				this.RemoveSelectionBox(item);
			} else {
				// Otherwise, nothing needs to be done, as it's the same style.
				return oldBox;
			}
		}

		const SelectionBox = new Instance("SelectionBox");
		SelectionBox.SurfaceTransparency = ItemSelectionEffectController.SELECTION_BOX_STYLE_TRANSPARENCY_SURFACE;
		SelectionBox.Transparency        = ItemSelectionEffectController.SELECTION_BOX_STYLE_TRANSPARENCY_BORDER;

		this.ItemSelectionBoxes.set(item, [SelectionBox, style]);

		switch (style) {
			case SelectionBoxStyle.ERROR: {
				SelectionBox.Color3        = ItemSelectionEffectController.SELECTION_BOX_STYLE_COLOR_ERROR;
				SelectionBox.SurfaceColor3 = ItemSelectionEffectController.SELECTION_BOX_STYLE_COLOR_ERROR;
				break;
			}
			case SelectionBoxStyle.NORMAL: {
				SelectionBox.Color3        = ItemSelectionEffectController.SELECTION_BOX_STYLE_COLOR_OKAY;
				SelectionBox.SurfaceColor3 = ItemSelectionEffectController.SELECTION_BOX_STYLE_COLOR_OKAY;
				break;
			}
		}

		SelectionBox.Adornee = item.instance;
		SelectionBox.Parent = item.instance;

		return SelectionBox;
	}

	/**
	 * Removes the selection box from the provided item.
	 */
	public RemoveSelectionBox (item: ItemComponent): void {
		if (!this.ItemSelectionBoxes.has(item)) return;
		this.ItemSelectionBoxes.get(item)![0].Destroy();
		this.ItemSelectionBoxes.delete(item);
	}
}

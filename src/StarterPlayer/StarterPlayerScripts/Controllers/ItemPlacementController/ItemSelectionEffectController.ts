import { Controller } from "@flamework/core";
import { Option } from "@rbxts/rust-classes";
import { CollectionService, RunService, TweenService } from "@rbxts/services";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";

export enum HighlightStyle {
	NONE,
	ERROR,
	HOVERING,
	SELECTED,
}

@Controller()
export class ItemSelectionEffectController {
	private readonly ItemHighlights = new Map<ItemComponent, [Highlight, HighlightStyle]>();
	private readonly ItemPickupEffectConnections = new Map<ItemComponent, Option<RBXScriptConnection>>();

	/**
	 * Sets the display of pickup animation to the provided state on the provided item.
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
	 * Adds a highlight to the provided item with the provided style (defaults to `SELECTED` style).
	 *
	 * If the style is `NONE`, then the highlight is removed.
	 */
	public SetHighlight (item: ItemComponent, style: Exclude<HighlightStyle, HighlightStyle.NONE>): Highlight;
	public SetHighlight (item: ItemComponent, style: HighlightStyle.NONE): undefined;
	public SetHighlight (item: ItemComponent, style = HighlightStyle.SELECTED): Highlight | undefined {
		let highlight: Highlight | undefined;

		if (style === HighlightStyle.NONE) {
			// The highlight should be destroyed.
			if (!this.ItemHighlights.has(item)) return;
			this.ItemHighlights.get(item)![0].Destroy();
			this.ItemHighlights.delete(item);
			return;
		} else if (!this.ItemHighlights.has(item)) {
			// A highlight doesn't yet exist, so make one.
			highlight = new Instance("Highlight");
			this.ItemHighlights.set(item, [highlight, style]);
		} else if (this.ItemHighlights.get(item)![1] === style) {
			// This is the same style, we don't need to do anything.
			// Just return the highlight that already exists.
			return this.ItemHighlights.get(item)![0];
		} else {
			// This a new style, create the highlight.
			highlight = this.ItemHighlights.get(item)![0];
			this.ItemHighlights.set(item, [highlight, style]);
		}

		assert(highlight, "highlight should exist before styling! (This should not occur!)");

		switch (style) {
			case HighlightStyle.ERROR: {
				highlight.FillColor = Color3.fromRGB(255, 0, 0);
				highlight.FillTransparency = 0.6;
				highlight.OutlineTransparency = 1;
				break;
			}
			case HighlightStyle.SELECTED: {
				highlight.FillTransparency = 1;
				highlight.OutlineColor = Color3.fromRGB(255, 255, 255);
				highlight.OutlineTransparency = 0;
				break;
			}
			case HighlightStyle.HOVERING: {
				highlight.FillTransparency = 1;
				highlight.OutlineColor = Color3.fromRGB(168, 168, 168);
				highlight.OutlineTransparency = 0.8;
				break;
			}
		}

		highlight.Adornee = item.instance;
		highlight.Parent = item.instance;

		return highlight;
	}

	/**
	 * Returns the highlight style for the provided item.
	 */
	public GetHighlight (item: ItemComponent): HighlightStyle {
		// A highlight hasn't been initialized, or was already removed.
		if (!this.ItemHighlights.has(item)) return HighlightStyle.NONE;
		// Otherwise, return it's actual style.
		return this.ItemHighlights.get(item)![1];
	}
}

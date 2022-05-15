import { LocalUser } from "StarterPlayer/StarterPlayerScripts/State";
import { Option } from "@rbxts/rust-classes";
import { Item } from "ReplicatedStorage/Classes/Item";
import Attributes from "@rbxts/attributes"
import Remotes from "ReplicatedStorage/Networking/Remotes";
import { ItemModelAttributes, ItemModelTemplateAttributes } from "ReplicatedStorage/Utility/Attributes";
import { setSelectionBox, SelectionBoxType } from "../Utility/ItemMovementSelectionBox";
import { getTargetCFrameAdjusted } from "../Utility/GetAdjustedTargetCFrame";
import { PlacementState } from "../PlacementState";
import { proxy } from "../PlacementProxy";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { moveItem } from "./Move";

/**
 * @returns Whether or not the item was picked and saved to `PlacementState`
 */
export function pickItem (): boolean {
	return getTargetCFrameAdjusted(1, PlacementState.Degrees).map(([cframe, part, normal]) => {
		const item = getItemFromPart(part);
		const exst = item.isSome();

		if (exst) {
			PlacementState.Item = item.unwrap();
			PlacementState.Normal = normal;
			const current = PlacementState.Item.model.GetPivot();
			PlacementState.Region = new ComplexRegion(PlacementState.Item!.model, (part) => !(part.GetAttribute("DoesNotBlockPlacement") as boolean ?? false));
			PlacementState.Degrees = math.deg(PlacementState.Item.model.GetPivot().ToEulerAnglesYXZ()[1]);
			PlacementState.Move = current;
			proxy.Value = current

			if (current.Position.sub(cframe.Position).Magnitude > 3.5) {
				// It's a fair distance, so tween instead of jumping.
				moveItem()
			}

			setSelectionBox(PlacementState.Item, SelectionBoxType.NORMAL);
			Remotes.Client.Item.MoveItem(PlacementState.Item!.instanceID)
			PlacementState.Item.setCollision(false);
			PlacementState.Item.showPickup(true);
		}

		return exst;
	}).unwrapOr(false)
}


/**
 * Internal behavior for picking an item.
 */
function getItemFromPart (target: BasePart): Option<Item> {
	const model = target.FindFirstAncestorOfClass("Model"); if (!model) return Option.none();
	const meta = Attributes<
		& ItemModelTemplateAttributes
		& Partial<ItemModelAttributes>
	>(model);

	return Option.wrap(LocalUser.inventory.items[meta.InstanceID as string] as Item | undefined);
}



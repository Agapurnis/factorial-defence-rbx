import { CollectionService } from "@rbxts/services";
import { SelectionBoxType, setSelectionBox } from "../Utility/ItemMovementSelectionBox";
import { getTargetCFrameAdjusted } from "../Utility/GetAdjustedTargetCFrame";
import { PlacementBehavior } from "ReplicatedStorage/Data/Enums/Settings/PlacemodeBehavior";
import { PlacementState } from "../PlacementState";
import { LocalUser } from "StarterPlayer/StarterPlayerScripts/State";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import { roundvec } from "ReplicatedStorage/Utility/RoundVector";


export function moveItem (): CFrame | undefined {
	if (!PlacementState.Item) return;
	if (!PlacementState.Region) return;

	let valid = true;

	const item = PlacementState.Item;
	const degree = PlacementState.Degrees;
	const region = PlacementState.Region;
	const result = getTargetCFrameAdjusted(1, degree, Vector3.zero, [item.model]);
	if (result.isErr()) return

	const bounds = item.model.GetBoundingBox();
	const offset = bounds[1].mul(new Vector3(1, 0, 1)).div(2)
	const cframe = LocalUser.settings.placement.behavior[0] === PlacementBehavior.OFF_OF_TARGET
		? result.map((v) => v[0].add(roundvec(v[2].mul(offset), 1).add(new Vector3(0, item.model.PrimaryPart!.Size.Y / 2, 0)))).unwrap()
		: result.map((v) => v[0]).unwrap();

	if (region.FindPartsInRegion(new OverlapParams(), (part) => {
		const doesNotBlockPlacement = part.GetAttribute("DoesNotBlockPlacement") as boolean ?? false;
		const isPartOfSelectedItem = part.IsDescendantOf(item.model)
		const isOre = CollectionService.HasTag(part, Tag.Ore);
		return !isOre && !isPartOfSelectedItem && !doesNotBlockPlacement;
	}).size() > 0) {
		setSelectionBox(item, SelectionBoxType.ERROR); valid = false
	} else {
		setSelectionBox(item, SelectionBoxType.NORMAL);
	}

	PlacementState.Move = cframe;

	return cframe;
}
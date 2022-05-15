import Remotes from "ReplicatedStorage/Networking/Remotes";
import { PlacementState } from "../PlacementState";
import { PlacementStatus } from "../PlacementStatus";
import { SelectionBoxType, setSelectionBox } from "../Utility/ItemMovementSelectionBox";

export function placeItem (): boolean {
	if (!PlacementState.Item) return false;

	PlacementState.Mode = PlacementStatus.Pick;
	setSelectionBox(PlacementState.Item, SelectionBoxType.NONE);

	const response = Remotes.Client.Item.PlaceItem(
		PlacementState.Item.instanceID,
		PlacementState.Move,
	).await();

	if (!response[0]) return false;
	if (response[1].isErr()) {
		// Revert to previous position and continue movement state for UX reasons.
		PlacementState.Item.model.PivotTo(PlacementState.Move);
		PlacementState.Mode = PlacementStatus.Move;

		return false;
	} else {
		PlacementState.Item.setCollision(true);
		PlacementState.Item.showPickup(false);

		return true;
	}
}
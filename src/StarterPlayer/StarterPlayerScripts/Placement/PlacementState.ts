import type { Item } from "ReplicatedStorage/Classes/Item";
import type { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { PlacementStatus } from "./PlacementStatus";

export const PlacementState: {
	Item?: Item,
	Normal?: Vector3,
	Region?: ComplexRegion
	Degrees: number,
	Mode: PlacementStatus
	Move: CFrame,
} = {
	Degrees: 0,
	Mode: PlacementStatus.Pick,
	Move: new CFrame()
};

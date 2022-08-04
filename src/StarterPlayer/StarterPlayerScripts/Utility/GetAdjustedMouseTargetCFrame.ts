import { CollisionGroup } from "ReplicatedStorage/Enums/CollisionGroup";
import { roundvec } from "ReplicatedStorage/Utility/RoundVector";
import { Players } from "@rbxts/services";
import { Result } from "@rbxts/rust-classes";

const PLACEMENT_RAYCAST_PARAMETERS = new RaycastParams();
PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = [];
PLACEMENT_RAYCAST_PARAMETERS.FilterType = Enum.RaycastFilterType.Blacklist;
PLACEMENT_RAYCAST_PARAMETERS.CollisionGroup = CollisionGroup.PlacementRaycastGlobalBlacklist;

const mouse = Players.LocalPlayer.GetMouse();

export const enum PlacementRaycastError {
	MOUSE_UNDEFINED,
	RAY_UNDEFINED,
	HIT_UNDEFINED,
}

/**
 * @param round — How to round the position of the hit vector. Can use either a number or a Vector3. Rounding is done upwards.
 * @param blacklist — A list of Instances and their descendants to ignore when raycasting.
 * @returns Result<[CFrame, BasePart], PlacementRaycastError>
 */
export function getAdjustedMouseTargetCFrame (round: number | Vector3 = 0, blacklist: Instance[] = []): Result<[adjusted: CFrame, instance: BasePart, normal: Vector3], PlacementRaycastError> {
	if (!mouse) return Result.err(PlacementRaycastError.MOUSE_UNDEFINED);
	PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = blacklist;
	const ray = game.Workspace.CurrentCamera?.ScreenPointToRay(mouse.X, mouse.Y); if (!ray) return Result.err(PlacementRaycastError.RAY_UNDEFINED);
	const hit = game.Workspace.Raycast(ray.Origin, ray.Direction.mul(500), PLACEMENT_RAYCAST_PARAMETERS);
	PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = [];
	if (!hit) return Result.err(PlacementRaycastError.HIT_UNDEFINED);
	const cframe = new CFrame(roundvec(hit.Position, round));
	return Result.ok([cframe, hit.Instance, hit.Normal]);
}

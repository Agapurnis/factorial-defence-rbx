import { getProhibitedScreenRegions } from "../ProhibitedRanges";
import { CollisionGroup } from "ReplicatedStorage/Data/Enums/CollisionGroup";
import { LocalUser } from "StarterPlayer/StarterPlayerScripts/State";
import { roundvec } from "ReplicatedStorage/Utility/RoundVector";
import { Result } from "@rbxts/rust-classes";

const PLACEMENT_RAYCAST_PARAMETERS = new RaycastParams();
PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = [];
PLACEMENT_RAYCAST_PARAMETERS.FilterType = Enum.RaycastFilterType.Blacklist;
PLACEMENT_RAYCAST_PARAMETERS.CollisionGroup = CollisionGroup.PlacementRaycast;

const mouse = LocalUser.player.GetMouse();

export const enum PlacementRaycastError {
	MOUSE_UNDEFINED,
	REGION_PROHIBITED,
	RAY_UNDEFINED,
	HIT_UNDEFINED,
}


/**
 * @param round — How to round the position of the hit vector. Can use either a number or a Vector3. Rounding is done upwards.
 * @param angles — How many *degrees* to rotate the hit vector as a CFrame. It uses `fromEulerAnglesYXZ` and applies the parameter as `Y` to preserve the most information.
 * @param offset — This is added to the hit vector position *after* rounding.
 * @param blacklist — A list of Instances and their descendants to ignore when raycasting.
 * @returns Result<[CFrame, BasePart], PlacementRaycastError>
 */
export function getTargetCFrameAdjusted (round: number | Vector3 = 0, angles = 0, offset = new Vector3(), blacklist: Instance[] = []): Result<[adusted: CFrame, instance: BasePart, normal: Vector3], PlacementRaycastError> {
	if (!mouse) return Result.err(PlacementRaycastError.MOUSE_UNDEFINED);
	if (getProhibitedScreenRegions().some((region) => mouse.X > region[0].X && mouse.X < region[1].X && mouse.Y > region[0].Y && mouse.Y < region[1].Y)) return Result.err(PlacementRaycastError.REGION_PROHIBITED);
	PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = blacklist;
	const ray = game.Workspace.CurrentCamera?.ScreenPointToRay(mouse.X, mouse.Y); if (!ray) return Result.err(PlacementRaycastError.RAY_UNDEFINED);
	const hit = game.Workspace.Raycast(ray.Origin, ray.Direction.mul(500), PLACEMENT_RAYCAST_PARAMETERS);
	PLACEMENT_RAYCAST_PARAMETERS.FilterDescendantsInstances = [];
	if (!hit) return Result.err(PlacementRaycastError.HIT_UNDEFINED);
	const cframe = new CFrame(roundvec(hit.Position, round).add(offset)).mul(CFrame.fromEulerAnglesYXZ(0, math.rad(angles), 0));
	return Result.ok([cframe, hit.Instance, hit.Normal]);
}

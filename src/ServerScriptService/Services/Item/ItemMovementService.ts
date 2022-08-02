import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import { ItemMovementError } from "ReplicatedStorage/Enums/Errors/ItemMovementError";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { roundvec } from "ReplicatedStorage/Utility/RoundVector";
import { Service } from "@flamework/core";
import { Result } from "@rbxts/rust-classes";

@Service()
export class ItemMovementService {
	/**
	 * A set of all the items that are currently in movement.
	 *
	 * Items that are in movement should be disabled and not function.
	 */
	private readonly ItemsInMovement = new Set<ItemComponent>();

	/**
	 * Returns a rounded cframe.
	 */
	public AdjustCFrame (cframe: CFrame): CFrame {
		const euler = cframe.ToEulerAnglesXYZ();
		const basis = math.pi / 2;
		// Rounding elements:
		const rpos = new CFrame(roundvec(cframe.Position, new Vector3(1, 0, 1)));
		const rang = CFrame.fromEulerAnglesXYZ(
			math.round(euler[0] / basis) * basis,
			math.round(euler[1] / basis) * basis,
			math.round(euler[2] / basis) * basis,
		);
		return rpos.mul(rang);
	}

	/**
	 * Returns a result containing the input CFrame if the CFrame provided was valid, otherwise an error as to why it's not valid.
	 */
	public ValidateItemPosition (cframe: CFrame, item: ItemComponent): Result<CFrame, ItemMovementError> {
		return item.CanMoveTo(cframe)
			? Result.ok(cframe)
			: Result.err(ItemMovementError.COLLISION);
	}

	/**
	 * Marks the item as 'in movement', returning whether or not it was already in movement.
	 *
	 * This also disables the functionality of the item, since items should not function while in movement.
	 */
	public MarkAsInMovement (item: ItemComponent): boolean {
		if (this.ItemsInMovement.has(item)) return true;
		this.ItemsInMovement.add(item);
		item.Enabled = false;
		return false;
	}

	/**
	 * Attempts to move the provided item to the provided location, after validating the location.
	 *
	 * If the item wasnt registered as being 'in movement', the item will not be moved.
	 *
	 * This will re-enable the functionality of the item.
	 *
	 * NOTE: If an item is disabled for other reasons, this will undo that. To rememdy this, we should perhaps instaed store 'ReasonsForDisabled' or such.
	 */
	public MoveItem (item: ItemComponent, cframe: CFrame): Result<CFrame, ItemMovementError> {
		if (!this.ItemsInMovement.has(item)) return Result.err(ItemMovementError.ITEM_NOT_IN_MOVEMENT);
		return this.ValidateItemPosition(this.AdjustCFrame(cframe), item).map((cframe) => {
			this.ItemsInMovement.delete(item);
			item.instance.PivotTo(cframe);
			item.Enabled = true;
			return cframe;
		});
	}
}

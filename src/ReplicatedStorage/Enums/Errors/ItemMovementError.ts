export const enum ItemMovementError {
	/**
	 * The item was not registered as being in movement prior to attempting to move the item.
	 */
	ITEM_NOT_IN_MOVEMENT = "ITEM_NOT_IN_MOVEMENT",
	/**
	 * The position is invalid and could not be automatically adjusted.
	 */
	INVALID_POSITION = "INVALID_POSITION",
	/**
	 * The item is colliding with another item
	 */
	COLLISION = "COLLISION",
}

export type ItemModelTemplateAttributes = Omit<ItemModelAttributes, "InstanceID">;

export interface ItemModelAttributes {
	/**
	 * The UUID of the item's register.
	 */
	readonly ItemID: string,
	/**
	 * The UUID of the item instance itself.
	 */
	readonly InstanceID: string,
}

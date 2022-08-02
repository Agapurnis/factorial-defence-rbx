/**
 * Psuedo-'region'
 *
 * This is used to detect collisions within areas.
 */
export class ComplexRegion {
	/**
	 * Parts on the provided model that can be collided with.
	 */
	private readonly checks: Set<BasePart>;

	/**
	 * @param instance - Top-level instance which will be checked for collisions against.
	 * @param filter - Function to filter out what parts of the provided instance can be collided with. (Returns `true` to keep and check for collisions with, `false` to ignore). Defaults to block all parts.
	 */
	constructor (
		private readonly instance: Instance,
		filter: (part: BasePart) => boolean = () => true,
	) {
		const parts = [instance, ...instance.GetDescendants()].filter((instance) => instance.IsA("BasePart")) as BasePart[];
		this.checks = new Set(parts.filter(filter));
	}

	/**
	 * Returns a set of all parts that the provided instance is colliding with, excluding the instance itself and it's descendants, alongside parts filtered by the parameters.
	 *
	 * @param overlap - Overlap Parameters
	 * @param filter - Function to filter out what parts that are colliding with the instance are actually returned. (Returns `true` to keep and check for collisions with, `false` to ignore). Defaults to block only parts that are the instance that is being checked and it's descendants.
	 */
	public FindPartsInRegion (
		overlap?: OverlapParams,
		filter: (part: BasePart) => boolean = (part) => !part.IsAncestorOf(this.instance),
	): Set<BasePart> {
		/**
		 * Parts which are colliding against the top-level instance and it's descendants.
		 */
		const set = new Set<BasePart>();

		for (const part of this.checks) {
			game.Workspace.GetPartsInPart(part, overlap)
				.filter((part): part is BasePart => part.IsA("BasePart"))
				.filter((part) => filter(part))
				.forEach((overlap) => set.add(overlap));
		}

		return set;
	}
}

export class ComplexRegion {
	private readonly parts: Set<BasePart>;
	private readonly checks: Set<BasePart>;

	constructor (
		model: Model,
		filter: (part: BasePart) => boolean = () => true,
	) {
		const parts = model.GetDescendants().filter((instance) => instance.IsA("BasePart")) as BasePart[];
		this.parts = new Set(parts)
		this.checks = new Set(parts.filter(filter));
	}

	public FindPartsInRegion (overlapParams?: OverlapParams, filter: (part: BasePart) => boolean = () => true): BasePart[] {
		const set = new Set<BasePart>();
		for (const part of this.checks) {
			game.Workspace.GetPartsInPart(part, overlapParams).forEach((overlap) => {
				if (!overlap.IsA("BasePart")) return;
				if (!filter(overlap)) return;
				if (this.parts.has(overlap)) return;
				set.add(overlap);
			});
		}
		return [...set];
	}
}
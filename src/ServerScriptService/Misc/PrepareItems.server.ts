import { ItemRegistry } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";

for (const [k, v] of pairs(ItemRegistry)) {
	if (typeIs(v.model.PrimaryPart, "nil")) throw `Model \`${k}\` does not have a primary part`;
	v.model.PivotTo(new CFrame(v.model.GetPivot().Position));
	v.model.GetDescendants().forEach((part) => {
		if (!part.IsA("BasePart")) return;
		part.Anchored = true;
	});
}

import type { Upgrader } from "ReplicatedStorage/Data/Registers/Items/Traits/Upgrader";
import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

interface UpgraderRestrictions {
	amount: number,
	cooldown: number,
}

/**
 * @returns whether or not the upgrade should **NOT** occur based on the given restriction parameters
 */
export function RestrictUpgrader (item: Item<Upgrader>, ore: Ore, restrictions: Partial<UpgraderRestrictions>): boolean {
	const ofType = ore.upgrades.map.get(item.registerID) ?? [];
	const time = ofType[ofType.size() - 1]?.[1] ?? 0;
	if (ofType.size() >= (restrictions?.amount ?? math.huge)) return true;
	if (time + (restrictions.cooldown ?? 0) >= os.clock()) return true;

	return false;
}

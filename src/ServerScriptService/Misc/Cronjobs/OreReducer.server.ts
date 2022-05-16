import { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { Timer } from "@rbxts/timer";
import { Item } from "ReplicatedStorage/Classes/Item";
import type { Ore } from "ReplicatedStorage/Classes/Ore";

const OreCleanupInterval = 25;
const OreRecordedPositions = new Map<Ore, Vector3>();
setmetatable(OreRecordedPositions, { __mode: "v" });

function cleanup () {
	ItemRepository.Cache.forEach((item) => {
		if (Item.isDropper(item)) {
			item.ores.forEach((ore) => {
				const current = ore.part.Position;
				const previous = OreRecordedPositions.get(ore);

				if (previous && current.sub(previous).FuzzyEq(Vector3.zero)) {
					task.delay(math.random(0, OreCleanupInterval), () => {
						ore.fade();
					});
				}

				OreRecordedPositions.set(ore, current);
			});
		}
	});
}

let timer: Timer | undefined;

function cycle () {
	cleanup();
	timer?.destroy();
	timer = new Timer(OreCleanupInterval);
	timer.completed.Connect(cycle);
	timer.start();
}

cycle();




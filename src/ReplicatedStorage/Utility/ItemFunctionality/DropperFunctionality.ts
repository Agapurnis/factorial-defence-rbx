import type { Item } from "ReplicatedStorage/Classes/Item";
import { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";

export function addDropperFunctionality (item: Item<Dropper>, _Item: typeof Item) {
	_Item.assertIsDropper(item);

	const oncomplete = () => {
		if (item.enabled) {
			_Item.assertIsDropper(item);
			item.ores.add(item.register.drop(item));
		}

		item.timer!.destroy();
		item.timer! = item.register.timer!();
		item.timer!.completed.Connect(oncomplete);
		item.timer!.start();
	}

	item.timer!.completed.Connect(oncomplete);
	item.timer!.start();
}
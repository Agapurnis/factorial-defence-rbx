import type { Item } from "ReplicatedStorage/Classes/Item";
import type { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";

/**
 * Adds basic functionality to a dropper item.
 *
 * - Creates a loop which will drop the item every time the timer (as specified by the dropper's register) is completed.
 *
 * @param item - The item to add functionality to.
 * @param _Item - The `Item` class constructor, used to assert that the item is a dropper. This is injected to prevent cyclic dependencies.
 */
export function addDropperFunctionality (item: Item<Dropper>, _Item: typeof Item) {
	_Item.assertIsDropper(item);

	const oncomplete = () => {
		if (item.enabled) {
			_Item.assertIsDropper(item);
			item.ores.add(item.register.drop(item));
		}

		item.timer!.destroy();
		item.timer = item.register.timer!();
		item.timer.completed.Connect(oncomplete);
		item.timer.start();
	};

	item.timer!.completed.Connect(oncomplete);
	item.timer!.start();
}

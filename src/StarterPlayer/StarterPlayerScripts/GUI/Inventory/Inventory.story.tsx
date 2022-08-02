import Roact from "@rbxts/roact";
import { Inventory } from "./Inventory";
import { InventoryState } from "./InventoryState";

export = function (target: Frame) {
	const tree = Roact.mount(<Inventory />, target);

	// It should be active for debugging purposes.
	InventoryState.Set("Active", true);

	return function () {
		Roact.unmount(tree);
	};
};

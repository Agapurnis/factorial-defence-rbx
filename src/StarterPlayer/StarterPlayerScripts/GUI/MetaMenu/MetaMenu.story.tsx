import Roact from "@rbxts/roact";
import { MetaMenu } from "./MetaMenu";
import { MetaMenuState } from "./MetaMenuState";

export = function (target: Frame) {
	const tree = Roact.mount(<MetaMenu />, target);

	// It should be active for debugging purposes.
	MetaMenuState.Set("Active", true);

	return function () {
		Roact.unmount(tree);
	};
};

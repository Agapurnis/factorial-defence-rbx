import Roact from "@rbxts/roact";
import { ItemInteractionPrompt } from "./ItemInteractionPrompt";

export = function (target: Frame) {
	const tree = Roact.mount((
		<screengui Key="ItemInteractionPromptStoryDevScreenGUI">
			<ItemInteractionPrompt />
		</screengui>
	), target);

	return function () {
		Roact.unmount(tree);
	};
};

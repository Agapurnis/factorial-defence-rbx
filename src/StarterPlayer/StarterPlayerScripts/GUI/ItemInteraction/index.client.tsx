
import Roact from "@rbxts/roact";
import { ItemInteractionPrompt } from "./ItemInteractionPrompt";
import { ItemInteractionPromptState } from "./ItemInteractionPromptState";

const [AdorneeBinding, SetAdorneeValue] = Roact.createBinding<PVInstance | undefined>(undefined);

ItemInteractionPromptState.GetChangedSignal("Adornee").Connect((adornee) => {
	SetAdorneeValue(adornee !== "NONE" ? adornee : undefined);
});

Roact.mount((
	<></>
	// <billboardgui
	// 	AlwaysOnTop={true}
	// 	MaxDistance={70}
	// 	Adornee={AdorneeBinding}
	// 	Enabled={AdorneeBinding.map((adornee) => adornee !== undefined)}
	// 	StudsOffsetWorldSpace={new Vector3(0, 7, 0)}
	// 	Key="ItemInteractionPromptBillboard"
	// 	Size={new UDim2(15, 0, 7.50, 0)}
	// 	>
	// 	<ItemInteractionPrompt />
	// </billboardgui>
), game.GetService("Players").LocalPlayer.FindFirstChildOfClass("PlayerGui"), "MetaMenuGUI");

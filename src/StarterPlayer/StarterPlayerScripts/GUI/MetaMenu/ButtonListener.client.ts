import { UserInputService } from "@rbxts/services";
import { MetaMenuState } from "./MetaMenuState";

UserInputService.InputEnded.Connect((input) => {
	if (input.KeyCode === MetaMenuState.Get("ToggleButton")) {
		MetaMenuState.Set("Active", !MetaMenuState.Get("Active"));
	}
});

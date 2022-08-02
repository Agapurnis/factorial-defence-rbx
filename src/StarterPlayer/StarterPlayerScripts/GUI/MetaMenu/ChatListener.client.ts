import { Players } from "@rbxts/services";
import { MetaMenuState } from "./MetaMenuState";

Players.LocalPlayer.Chatted.Connect((message) => {
	if (message === "/metamenu") {
		MetaMenuState.Set("Active", !MetaMenuState.Get("Active"));
	}
});

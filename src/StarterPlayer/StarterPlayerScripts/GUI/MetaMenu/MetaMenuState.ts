import BasicState from "@rbxts/basicstate";
import { MetaMenuPage } from "./Enums/Page";

export const MetaMenuState = new BasicState({
	Active: false,
	ToggleButton: Enum.KeyCode.F9 as Enum.KeyCode | "NONE",
	ToggleSound: "rbxassetid://9120093002" as string | "NONE",
	PageMinimumSize: Vector2.zero,
	PageSwitchSound: "rbxassetid://9090993751" as string | "NONE",
	Pages: [
		["Home", MetaMenuPage.HOME],
		["Data", MetaMenuPage.DATA]
	],
	Page: MetaMenuPage.HOME,

	Theme: {
		Background: {
			Main: Color3.fromRGB(46, 46, 46),
			Topbar: Color3.fromRGB(71, 71, 71),
		},
		Interactive: {
			Dragger: Color3.fromRGB(196, 199, 243),
		},
		Text: {
			Main: Color3.fromRGB(255, 255, 255),
			MainStroke: Color3.fromRGB(0, 0, 0),
			Sub: Color3.fromRGB(194, 194, 194),
			SubStroke: Color3.fromRGB(0, 0, 0),
		},
		Status: {
			Info: Color3.fromRGB(59, 107, 237),
			Error: Color3.fromRGB(227, 84, 84),
			Success: Color3.fromRGB(38, 230, 102),
		}
	}
});

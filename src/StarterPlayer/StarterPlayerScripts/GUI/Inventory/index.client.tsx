import Roact from "@rbxts/roact";
import { Inventory } from "./Inventory";
import { StarterGui } from "@rbxts/services";

Roact.mount(<Inventory />, game.GetService("Players").LocalPlayer.FindFirstChildOfClass("PlayerGui"), "MetaMenuGUI");

// Disable the native backpack.
StarterGui.SetCoreGuiEnabled(Enum.CoreGuiType.Backpack, false);

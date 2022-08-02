import Roact from "@rbxts/roact";
import { MetaMenu } from "./MetaMenu";

Roact.mount(<MetaMenu />, game.GetService("Players").LocalPlayer.FindFirstChildOfClass("PlayerGui"), "MetaMenuGUI");

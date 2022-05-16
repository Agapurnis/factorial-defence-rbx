import { InventoryGUI } from "./Inventory";
import { OverlayGUI } from "./Overlay";
import { ShopGUI } from "./Shop";
import { Players } from "@rbxts/services";
import Roact from "@rbxts/roact";
import { ItemPopoutGUI } from "./Components/ItemPopout";

Roact.mount(<screengui>
	<InventoryGUI opened={false} />
	<ShopGUI opened={false} />
	<ItemPopoutGUI />
	<OverlayGUI />
</screengui>, Players.LocalPlayer.WaitForChild("PlayerGui"));


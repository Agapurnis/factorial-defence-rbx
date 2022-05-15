import Remotes from "ReplicatedStorage/Networking/Remotes";
import { createItem, moveItem, placeItem, purchaseItem } from "./ItemService";

Remotes.Server.Item.CreateItem.SetCallback(createItem)
Remotes.Server.Item.PurchaseItem.SetCallback(purchaseItem)

Remotes.Server.Item.PlaceItem.SetCallback(placeItem);
Remotes.Server.Item.MoveItem.SetCallback(moveItem)

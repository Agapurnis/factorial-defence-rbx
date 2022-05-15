import { Players } from "@rbxts/services";
import Remotes from "ReplicatedStorage/Networking/Remotes";

// There's a weird bug relating to the lazy-loading of the client remote
// with `netbuilder`, so we have a monkey-patch here that jus ensures it
// will exist by the time it is actually needed by invoking it, which will
// ensure that it gets added to the ReplicatedStorage and is accessible.

function patch (player: Player) {
	Remotes.Server.Currency.InformUpdate.Send(player, 0);
	Remotes.Server.Item.InformInventoryUpdate.Send(player, []);
}

Players.PlayerAdded.Connect((player) => {
	patch(player)
})

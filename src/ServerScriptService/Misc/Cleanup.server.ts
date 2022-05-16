import { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { UserRepository } from "ServerScriptService/Networking/Implementations/User/UserRepository";
import { UserStores } from "ServerScriptService/Storage/UserStore";
import { Players } from "@rbxts/services";

// Ensure the removal of references to the user to prevent memory leakage.`

Players.PlayerRemoving.Connect((player) => {
	const user = UserRepository.get(player.UserId).expect("user to exist");

	if (user) {
		for (const [id, item] of pairs(user.inventory.items)) {
			item.timer?.destroy();
			ItemRepository.delete(id);
			item.model.Destroy();
			item.ores?.forEach((ore) => ore.part.Destroy());
		}

		UserRepository.delete(player.UserId);
	}

	UserStores.get(player.UserId)?.Save();
	UserStores.delete(player.UserId);
});

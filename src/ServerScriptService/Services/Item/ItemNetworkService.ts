import { Result } from "@rbxts/rust-classes";
import { Service } from "@flamework/core";
import { GenericError } from "ReplicatedStorage/Networking/GenericError";
import type { ItemMovementService } from "ServerScriptService/Services/Item/ItemMovementService";
import type { ItemService } from "ServerScriptService/Services/Item/ItemService";
import type { UserService } from "ServerScriptService/Services/User/UserService";
import Remotes from "ReplicatedStorage/Networking";

@Service()
class ItemNetworkService {
	public constructor (
		private readonly UserService: UserService,
		private readonly ItemService: ItemService,
		private readonly ItemMovementService: ItemMovementService,
	) {
		Remotes.CreateItems.SetCallback((player, items) => {
			return items.map((uuid) => {
				return this.UserService.GetUser(player).okOr(GenericError.NOT_FOUND)
					.map((user) => this.ItemService.CreateItem(user, uuid)).flatten()
					.map((item) => item.attributes.ItemInstanceUUID);
			});
		});

		Remotes.StartMovingItems.SetCallback((player, items) => {
			return items.map((uuid) => {
				const user = this.UserService.GetUser(player);
				const item = this.ItemService.GetItem(uuid);
				if (user.isNone() || item.isNone()) return Result.err(GenericError.NOT_FOUND);
				if (user.unwrap() !== item.unwrap().Owner) return Result.err(GenericError.FORBIDDEN);
				this.ItemMovementService.MarkAsInMovement(item.unwrap());
				return Result.ok(true);
			});
		});

		Remotes.PlaceItems.SetCallback((player, items) => {
			return items.map(([uuid, cframe]) => {
				const user = this.UserService.GetUser(player);
				const item = this.ItemService.GetItem(uuid);
				if (user.isNone() || item.isNone()) return Result.err(GenericError.NOT_FOUND);
				if (user.unwrap() !== item.unwrap().Owner) return Result.err(GenericError.FORBIDDEN);
				return this.ItemMovementService.MoveItem(item.unwrap(), cframe);
			});
		});
	}
}

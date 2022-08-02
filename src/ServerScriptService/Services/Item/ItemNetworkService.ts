import { Result } from "@rbxts/rust-classes";
import { Service } from "@flamework/core";
import { Remotes } from "ReplicatedStorage/Networking";
import type { ItemMovementService } from "ServerScriptService/Services/Item/ItemMovementService";
import type { ItemService } from "ServerScriptService/Services/Item/ItemService";
import type { UserService } from "ServerScriptService/Services/User/UserService";
import { GenericError } from "ReplicatedStorage/Networking/GenericError";

@Service()
class ItemNetworkService {
	public constructor (
		private readonly UserService: UserService,
		private readonly ItemService: ItemService,
		private readonly ItemMovementService: ItemMovementService,
	) {
		Remotes.Server.Item.CreateItem.SetCallback((player, [uuid]) => {
			return this.UserService.GetUser(player).okOr(GenericError.NOT_FOUND)
				.map((user) => this.ItemService.CreateItem(user, uuid)).flatten()
				.map((item) => item.attributes.ItemInstanceUUID);
		});

		Remotes.Server.Item.StartMovingItem.SetCallback((player, [uuid]) => {
			const user = this.UserService.GetUser(player);
			const item = this.ItemService.GetItem(uuid);
			if (user.isNone() || item.isNone()) return Result.err(GenericError.NOT_FOUND);
			if (user.unwrap() !== item.unwrap().Owner) return Result.err(GenericError.FORBIDDEN);
			this.ItemMovementService.MarkAsInMovement(item.unwrap());
			return Result.ok(true);
		});

		Remotes.Server.Item.PlaceItem.SetCallback((player, [uuid, components]) => {
			type ExtractLuaTuple <T extends LuaTuple<unknown[]>> = T extends LuaTuple<infer U> ? U : never;
			type CFrameComponents = ExtractLuaTuple<ReturnType<CFrame["GetComponents"]>>;
			const user = this.UserService.GetUser(player);
			const item = this.ItemService.GetItem(uuid);
			if (user.isNone() || item.isNone()) return Result.err(GenericError.NOT_FOUND);
			if (user.unwrap() !== item.unwrap().Owner) return Result.err(GenericError.FORBIDDEN);
			return this.ItemMovementService.MoveItem(item.unwrap(), new CFrame(...components)).map((cframe) => [...cframe.GetComponents()] as CFrameComponents);
		});
	}
}

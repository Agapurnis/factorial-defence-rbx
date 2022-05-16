import DataStore2 from "@rbxts/datastore2";
import { Result } from "@rbxts/rust-classes";
import { User, UserData } from "ReplicatedStorage/Classes/User";
import Remotes from "ReplicatedStorage/Networking/Remotes";
import { LoadUserError } from "ReplicatedStorage/Networking/Definitions/User/LoadUser";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { ServerCreatedTimestamp } from "ServerScriptService/Misc/ServerCreatedTimestamp";
import { UserStoreKey, UserStores } from "ServerScriptService/Storage/UserStore";
import { ItemRepository } from "../Item/ItemRepository";
import { UserRepository } from "./UserRepository";

export async function createUser (player: Player): Promise<Result<UserData, GenericError>> {
	const store = DataStore2<UserData>(UserStoreKey, player);

	return store.GetAsync().then<Result<UserData, GenericError>>((value) => {
		if (!typeIs(value, "nil")) return Result.err(GenericError.AlreadyExists);

		const user = new User(player);
		const data = user.serialize();
		store.Set(data);
		UserRepository.set(player.UserId, user);
		return Result.ok(data);
	}).catch((err) => {
		warn(err)
		return Result.err(GenericError.DataStoreFailure);
	})
}

export function deleteUser (player: Player): boolean {
	const store = UserStores.get(player.UserId) ?? DataStore2<UserData>(UserStoreKey, player); if (!store) return false;
	const user = UserRepository.get(player.UserId); if (user.isNone()) return false;

	for (const [id, item] of pairs(user.unwrap().inventory.items)) {
		ItemRepository.delete(id)
		item.timer?.destroy()
		item.ores?.forEach((ore) => ore.part.Destroy())
		item.model.Destroy()
	}

	UserRepository.delete(player.UserId);

	store.Set(undefined!);
	store.Save();
	UserStores.delete(player.UserId);

	return true
}

export async function loadUser (player: Player): Promise<Result<UserData, GenericError | LoadUserError>> {
	if (UserRepository.has(player.UserId)) {
		// We already have the user cached, so just return it.
		return UserRepository.get(player.UserId).map((u) => u.serialize()).okOrElse(() => GenericError.NotFound);
	}

	const store = UserStores.get(player.UserId) || DataStore2<UserData>(UserStoreKey, player);
	if (!store) return Result.err(GenericError.UnknownInternalServiceError);
	UserStores.set(player.UserId, store);

	return store.GetAsync().then<Result<UserData, GenericError | LoadUserError>>((data) => {
		if (!data) return Result.err(GenericError.NotFound)
		if (data.joined[1] > ServerCreatedTimestamp) {
			// This user is using a schema above that of what the server supports.
			// This shouldn't happen in ideal cases, but it's best to be safe.
			return Result.err(LoadUserError.OutdatedServer)
		}

		const user = User.Deserialize(player, UserRepository.migrate(data));

		UserRepository.set(player.UserId, user);

		for (const [id, item] of pairs(user.inventory.items)) {
			ItemRepository.set(id, item)
		}

		// Populate inventory GUI with contents of inventory.
		const built: [string, number][] = [];
		for (const [id, count] of pairs(user.inventory.count)) built.push([id, count])
		Remotes.Server.Item.InformInventoryUpdate.Send(player, built);

		// Reserialize because we might have made mutations.
		return Result.ok(user.serialize());
	}).catch((err) => {
		warn(err)
		return Result.err(GenericError.DataStoreFailure);
	})
}

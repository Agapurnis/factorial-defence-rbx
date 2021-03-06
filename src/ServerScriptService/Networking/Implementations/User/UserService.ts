import DataStore2 from "@rbxts/datastore2";
import { Result } from "@rbxts/rust-classes";
import type { UserData } from "ReplicatedStorage/Classes/User";
import { User } from "ReplicatedStorage/Classes/User";
import Remotes from "ReplicatedStorage/Networking/Remotes";
import { LoadUserError } from "ReplicatedStorage/Networking/Definitions/User/LoadUser";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { ServerCreatedTimestamp } from "ServerScriptService/Misc/ServerCreatedTimestamp";
import { UserStoreKey, UserStores } from "ServerScriptService/Storage/UserStore";
import { ItemRepository } from "../Item/ItemRepository";
import { UserRepository } from "./UserRepository";

/**
 * Attempts to create a `User` for the given player.
 * This will fail if there is already a `User` associated with the player.
 *
 * @param player - PLayer to create the item for.
 */
export async function createUser (player: Player): Promise<Result<UserData, GenericError>> {
	const store = DataStore2<UserData>(UserStoreKey, player);

	return store.GetAsync().then<Result<UserData, GenericError>>((value) => {
		// If there is already a present value, bail to prevent creating two users.
		if (!typeIs(value, "nil")) return Result.err(GenericError.AlreadyExists);

		const user = new User(player);
		const data = user.serialize();
		store.Set(data);
		UserRepository.set(player.UserId, user);
		return Result.ok(data);
	}).catch((err) => {
		warn(err);
		return Result.err(GenericError.DataStoreFailure);
	});
}

/**
 * Attempts to delete the user of the given player.
 * @param player - The player to delete the user of.
 */
export function deleteUser (player: Player): boolean {
	// Ensure there actually is a user for the player.
	const store = UserStores.get(player.UserId) ?? DataStore2<UserData>(UserStoreKey, player); if (!store) return false;
	const user = UserRepository.get(player.UserId); if (user.isNone()) return false;

	for (const [id, item] of pairs(user.unwrap().inventory.items)) {
		ItemRepository.delete(id);
		item.timer?.destroy();
		item.ores?.forEach((ore) => ore.part.Destroy());
		item.model.Destroy();
	}

	UserRepository.delete(player.UserId);

	store.Set(undefined!);
	store.Save();
	UserStores.delete(player.UserId);

	return true;
}

/**
 * Attempts to load and return the user data for the given player.
 * @param player - Player of whom to load the user for.
 */
export async function loadUser (player: Player): Promise<Result<UserData, GenericError | LoadUserError>> {
	if (UserRepository.has(player.UserId)) {
		// We already have the user cached, so just return it.
		return UserRepository.get(player.UserId).map((u) => u.serialize()).okOrElse(() => GenericError.NotFound);
	}

	// Create a store connection and save it for future usage.
	const store = UserStores.get(player.UserId) || DataStore2<UserData>(UserStoreKey, player);
	if (!store) return Result.err(GenericError.UnknownInternalServiceError);
	UserStores.set(player.UserId, store);

	return store.GetAsync().then<Result<UserData, GenericError | LoadUserError>>((data) => {
		if (!data) return Result.err(GenericError.NotFound);
		if (data.joined[1] > ServerCreatedTimestamp) {
			// This user is using a scheme that is newer than what the server can support.
			// This ideally should not happen, but it's best to be safe.
			return Result.err(LoadUserError.OutdatedServer);
		}

		const user = User.Deserialize(player, UserRepository.migrate(data));

		UserRepository.set(player.UserId, user);

		for (const [id, item] of pairs(user.inventory.items)) {
			ItemRepository.set(id, item);
		}

		// Build contents of inventory into an array and inform the inventory GUI of it's contents.
		const built: [string, number][] = [];
		for (const [id, count] of pairs(user.inventory.count)) built.push([id, count]);
		Remotes.Server.Item.InformInventoryUpdate.Send(player, built);

		// Reserialize because changes may have been made during potential data migrations.
		return Result.ok(user.serialize());
	}).catch((err) => {
		warn(err);
		return Result.err(GenericError.DataStoreFailure);
	});
}

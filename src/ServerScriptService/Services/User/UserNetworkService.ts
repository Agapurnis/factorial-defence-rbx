import type { UserService } from "./UserService";
import type { UserDataService } from "./UserDataService";
import type { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import { CollectionService } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { Option, Result } from "@rbxts/rust-classes";
import { GenericError } from "ReplicatedStorage/Enums/GenericError";
import { Service } from "@flamework/core";
import Remotes from "ReplicatedStorage/Networking";

@Service()
export class UserNetworkService {
	public constructor (
		private readonly UserService: UserService,
		private readonly UserDataService: UserDataService
	) {
		Remotes.SaveUserData.SetCallback((player) => {
			return this.UserService.GetUser(player).map((user): Result<true, GenericError | UserDataServiceError> => this.UserDataService.Save(user)).unwrapOr(Result.err(GenericError.NOT_FOUND));
		});

		Remotes.DeleteUserData.SetCallback((player, FullClear) => {
			const userResult = this.UserService.GetUser(player); if (userResult.isNone()) { return Result.err(GenericError.NOT_FOUND); }
			const user = userResult.unwrap();

			user.SaveOnLogout = !FullClear;
			user.PlacedItems.forEach((item, uuid) => {
				user.PlacedItems.delete(uuid);
				item.instance.Destroy();
				item.destroy();
			});

			return this.UserDataService.Delete(user).map((success) => {
				CollectionService.RemoveTag(player, CollectionTag.USER);

				for (const [key] of pairs(player.GetAttributes())) {
					player.SetAttribute(key , undefined);
				}

				if (FullClear) {
					// Kick the user as they'd basically just be a ghost unable to do anything, and it might cause issues.
					player.Kick("Your data has been removed.");
				} else {
					// Re-initialize the component so they can function as a user but without their prior data.
					CollectionService.AddTag(player, CollectionTag.USER);
					// Wait for Flamework to initialize the component, and reset their 'last saved' time for the approprite cooldown.
					task.defer(() => this.UserService.GetUser(player).unwrap().LastSaved = Option.some(tick()));
				}

				return success;
			});
		});
	}
}

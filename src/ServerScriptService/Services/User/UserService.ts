import type { UserDataService }  from "./UserDataService";
import type { UserComponent } from "ReplicatedStorage/Components/User";
import type { ItemService } from "../Item/ItemService";
import type { LoggerService } from "../LoggerService";
import type { OnStart } from "@flamework/core";
import type { Logger } from "@rbxts/log";
import { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import { Dependency, Service } from "@flamework/core";
import { CollectionService, Players } from "@rbxts/services";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import type { Components } from "@flamework/components";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import { Option } from "@rbxts/rust-classes";

@Service()
export class UserService implements OnStart {
	/**
 	 * Logger for debugging and analytics.
	 */
	private readonly Logger: Logger;

	constructor (
		private readonly UserDataService: UserDataService,
		private readonly LoggerService: LoggerService,
		private readonly Components: Components,
	) {
		this.Logger = this.LoggerService.GetLogger<this>();
	}

	onStart () {
		Players.GetPlayers().forEach((player) => {
			this.InitializePlayer(player);
		});
		Players.PlayerAdded.Connect((player) => {
			this.InitializePlayer(player);
		});
	}

	private InitializePlayer (player: Player) {
		assert(!this.Components.getComponent<UserComponent>(player), "User component already exists for player!");

		this.Logger.Info(`Initializing a \`UserComponent\` instance`, { PlayerUserID: player.UserId, });

		CollectionService.AddTag(player, CollectionTag.USER);

		task.defer(() => {
			// Defer so we can give enough time for flamework to create the component.
			const user = this.GetUser(player).expect("user component wasn't initialized!");
			const data = this.UserDataService.Get(user).expect("issue retrieving data");

			// Set the user's currency to the amount they had stored.
			for (const [currency] of pairs(Currency)) {
				if (data.Balance[currency] === undefined) {
					const FALLBACK_AMOUNT = 0;

					this.Logger.ForProperties({
						AffectedUserID: player.UserId,
						AffectedCurrency: currency,
					}).Error(
						`User data was missing a balance for Currency \`${currency}\`. ` +
						`(Migration issue? Defaulting to \`${FALLBACK_AMOUNT}\`.)`
					);

					data.Balance[currency] = FALLBACK_AMOUNT;
				}

				user.setAttribute(`Balance_${currency}`, data.Balance[currency]);
			}

			for (const [uuid, { Register, CFrameComponents }] of pairs(data.Items)) {
				Dependency<ItemService>().CreateItem(user, Register, uuid, new CFrame(...CFrameComponents)).expect("unable to create item while loading user data");
			}

			user.maid.GiveTask(() => {
				const user = this.GetUser(player).expect("user component does not exist for leaving player");

				if (user.SaveOnLogout) {
					this.UserDataService.Save(user).mapErr((err) => {
						if (
							err !== UserDataServiceError.SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING &&
							err !== UserDataServiceError.COOLDOWN
						) error(err);
					});
				}

				// Remove all items the user has placed.
				user.PlacedItems.forEach((item) => {
					item.instance.Destroy();
					item.destroy();
				});
			});
		});
	}

	/**
	 * Returns the user for the assosciated player.
	 */
	public GetUser (player: Player): Option<UserComponent> {
		return Option.wrap(this.Components.getComponent<UserComponent>(player));
	}
}

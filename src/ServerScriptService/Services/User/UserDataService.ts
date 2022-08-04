import type { Logger } from "@rbxts/log";
import type { LoggerService } from "../LoggerService";
import type { MigrationRetrievalService } from "../MigrationRetrievalService";
import type { UserComponent, UserData } from "ReplicatedStorage/Components/User";
import type { UserService } from "./UserService";
import type { ItemData } from "ReplicatedStorage/Components/Item";
import { DataStoreService, Players, RunService, ServerStorage } from "@rbxts/services";
import { getSymmetricEnumMembers } from "ReplicatedStorage/Utility/GetEnumMembers";
import { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import { Dependency, Service } from "@flamework/core";
import { Option, Result } from "@rbxts/rust-classes";
import { DataStoreKey } from "ReplicatedStorage/Enums/DataStoreKey";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import MockDataStoreService from "@rbxts/mockdatastoreservice";
import { MigratableDataStructure } from "ReplicatedStorage/Enums/MigratableDataStructure";

const enum SaveInStudioOption {
	MOCK  = "MOCK",
	TRUE  = "TRUE",
	FALSE = "FALSE",
}

const SaveInStudioValidOptions = [SaveInStudioOption.MOCK, SaveInStudioOption.TRUE, SaveInStudioOption.FALSE] as const;
const SaveInStudio = (ServerStorage.WaitForChild("SaveInStudio") as StringValue) as StringValue & { Value: SaveInStudioOption };

if (!SaveInStudioValidOptions.includes(SaveInStudio.Value)) {
	const FALLBACK = SaveInStudioOption.FALSE;
	warn(`\`${SaveInStudio.Value}\` is not a valid \`SaveInStudio\` option. Valid options are: \`${SaveInStudioValidOptions.join("` | `")}\`. A fallback value of \`${FALLBACK}\` will be used.`);
	SaveInStudio.Value = FALLBACK;
}

@Service({ loadOrder: -50 })
export class UserDataService {
	/**
	 * The cooldown in-between writes, in seconds.
	 */
	public static WRITE_COOLDOWN = 6;

	/**
	 * A fallback value for the 'last saved' timestamp of a user.
	 *
	 * A value that is an inverse of a sligtly increased WRITE_COOLDOWN  is used to allow the users to save within the WRITE_COOLDOWN ofs the server join time.
	 */
	public static LAST_SAVED_FALLBACK = UserDataService.WRITE_COOLDOWN * 1.5 * -1;

	/**
	 * User data to use when none is available.
	 */
	public static BLANK_USER_DATA: UserData = {
		Items: {},
		Balance: getSymmetricEnumMembers(Currency).reduce((obj, currency) => { obj[currency] = 0; return obj; }, {} as Record<Currency, number>),
		Statistics: {
			LastJoin: 0,
			FirstJoin: 0,
			TimePlayed: 0,
		},
	};

	/**
 	 * Logger for debugging and analytics.
	 */
	private readonly Logger: Logger;

	/**
	 * Retrieves either a mock or real DataStoreService depending on `SaveInStudio` and whether the game is running in studio.
	 */
	private GetDataStoreService (): DataStoreService {
		if (RunService.IsStudio() && SaveInStudio.Value === SaveInStudioOption.MOCK) {
			return MockDataStoreService;
		}

		return DataStoreService;
	}

	/**
	 * Returns whether or not an operation should occur and persist based on the `SaveInStudio` option.
	 */
	private ShouldSave () {
		if (RunService.IsStudio() && SaveInStudio.Value === SaveInStudioOption.FALSE) {
			return false;
		}

		return true;
	}

	/**
	 * Attempts to delete the stored data about the user.
	 */
	public Delete (user: UserComponent): Result<true, UserDataServiceError> {
		const snap = tick();
		const diff = snap - user.LastSaved.unwrapOr(UserDataService.LAST_SAVED_FALLBACK);
		if (diff < UserDataService.WRITE_COOLDOWN) return Result.err(UserDataServiceError.COOLDOWN);
		user.LastSaved = Option.some(snap);

		return this.ShouldSave()
			? pcall(() => this.GetDataStoreService().GetDataStore(DataStoreKey.USER).RemoveAsync(tostring(user.instance.UserId)))[0]
				? Result.ok(true)
				: Result.err(UserDataServiceError.DATA_STORE_FAILURE)
			: Result.err(UserDataServiceError.SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING);
	}

	/**
	 * Attempts to retrieve the stored data about the user.
	 */
	public Get (user: UserComponent): Result<UserData, UserDataServiceError> {
		// eslint-disable-next-line prefer-const
		let [success, data] = pcall(() => this.GetDataStoreService().GetDataStore(DataStoreKey.USER).GetAsync(tostring(user.instance.UserId))[0]) as LuaTuple<[false, undefined] | [true, undefined | UserData]>;
		if (!success) return Result.err(UserDataServiceError.DATA_STORE_FAILURE);
		if (data === undefined ) return Result.ok({ ...UserDataService.BLANK_USER_DATA });
		this.MigrationRetrievalService.GetMigrationsFromUTC(data.Statistics.LastJoin)
			.filter(({ Scope }) => Scope === MigratableDataStructure.USER_DATA)
			.forEach((MigrationSpecification) => {
				// In a perfect world this would be totally type-safe,
				// but we'll have to rely on our tests to ensure that the data is correct.
				data = MigrationSpecification.Migrate(data as never) as UserData;
			});
		return Result.ok(data);
	}

	/**
	 * Attempts to save the user's data.
	 */
	public Save (user: UserComponent): Result<true, UserDataServiceError> {
		if (!this.ShouldSave()) return Result.err(UserDataServiceError.SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING);

		// The user shouldn't be able to spam-queue write requests.
		const snap = tick();
		const diff = snap - user.LastSaved.unwrapOr(UserDataService.LAST_SAVED_FALLBACK);
		if (diff < UserDataService.WRITE_COOLDOWN) return Result.err(UserDataServiceError.COOLDOWN);
		user.LastSaved = Option.some(snap);

		return this.Get(user).andWith((data) => {
			const now = DateTime.now().UnixTimestampMillis;

			data["Items"] = [...user.PlacedItems].reduce((obj, [uuid, item]) => { obj[uuid] = item.AsData(); return obj; }, {} as Record<string, ItemData>);
			data["Balance"] = getSymmetricEnumMembers(Currency).reduce((obj, currency) => { obj[currency] = user.attributes[`Balance_${currency}`]; return obj; }, {} as Record<Currency, number>);
			data["Statistics"] = {
				TimePlayed: data["Statistics"]["TimePlayed"] + (now - user.ServerJoinTime),
				FirstJoin: 	data["Statistics"]["FirstJoin"] ?? user.ServerJoinTime,
				LastJoin: user.ServerJoinTime,
			};

			const [success] = pcall(() => {
				return this.GetDataStoreService().GetDataStore(DataStoreKey.USER).SetAsync(tostring(user.instance.UserId), data, [user.instance.UserId]);
			});

			if (!success) return Result.err(UserDataServiceError.DATA_STORE_FAILURE);

			return Result.ok(true);
		});
	}

	constructor (
		private readonly LoggerService: LoggerService,
		private readonly MigrationRetrievalService: MigrationRetrievalService
	) {
		this.Logger = this.LoggerService.GetLogger<this>();

		game.BindToClose(() => {
			this.Logger.Info("Shutdown detected, attempting to save all user data.");

			const UserService = Dependency<UserService>();

			let IssueOccuredWhileSaving = false;

			Players.GetPlayers().forEach((player) => {
				const UserResult = UserService.GetUser(player);
				if (UserResult.isNone()) {
					this.Logger.ForProperties({
						AffectedUserID: player.UserId,
						Error: "User component not found for player.",
					}).Error(`Unable to save a user's data during server shutdown!`);
					IssueOccuredWhileSaving = true;
					return;
				}

				const SaveResult = this.Save(UserResult.unwrap());
				if (SaveResult.isErr() && (
					// At most, six seconds of data was lost in a non-testing environment.
					SaveResult.unwrapErr() !== UserDataServiceError.SAVING_IN_STUDIO_DISABLED_WHEN_NOT_MOCKING &&
					SaveResult.unwrapErr() !== UserDataServiceError.COOLDOWN
				)) {
					this.Logger.ForProperties({
						AffectedUserID: player.UserId,
						Error: SaveResult.unwrapErr(),
					}).Error(`Unable to save a user's data during server shutdown!`);
					IssueOccuredWhileSaving = true;
				}
			});

			if (IssueOccuredWhileSaving) {
				this.Logger.Warn("Not all user data was saved.");
			} else {
				this.Logger.Info("Successfully saved all user data.");
			}
		});
	}
}

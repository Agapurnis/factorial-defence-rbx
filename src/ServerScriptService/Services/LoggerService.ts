import type { LogEvent } from "@rbxts/log";
import type { Modding } from "@flamework/core";
import Log, { Logger } from "@rbxts/log";
import { ConstantUserRanks } from "ServerStorage/ConstantUserRanks";
import { UserRankFlag } from "ReplicatedStorage/Enums/UserRankFlag";
import { Remotes } from "ReplicatedStorage/Networking";
import { Players } from "@rbxts/services";
import { Service } from "@flamework/core";
import { $env } from "rbxts-transform-env";

export interface LogAdditionalDetails {
	Identifier: string
}

@Service({ loadOrder: -100 })
export class LoggerService {
	private static readonly VOID_LOGGER = Log.Configure().Create();

	private readonly AuthorizedRank: UserRankFlag[] = [UserRankFlag.DEVELOPER];
	private readonly AuthorizedUsers = new WeakSet<Player>();
	private readonly Loggers = new Map<string, Logger>();

	constructor () {
		// Authorize a player if the meet the qualifications to recieve server log messages.
		Players.GetPlayers().forEach((player) => { if (ConstantUserRanks.get(player.UserId)?.some((rank) => this.AuthorizedRank.includes(rank))) { this.AuthorizedUsers.add(player); } });
		Players.PlayerAdded.Connect((player) => { if (ConstantUserRanks.get(player.UserId)?.some((rank) => this.AuthorizedRank.includes(rank))) { this.AuthorizedUsers.add(player); } });
	}

	/**
	 * Transmits the log to all qualified players.
	 */
	private SendLog (log: LogEvent) {
		if (this.AuthorizedUsers.size() === 0) return;

		this.AuthorizedUsers.forEach((player) => {
			Remotes.Server.MetaMenu.MetaMenuLogEvent.Send(player, log);
		});
	}

	/**
	 * @metadata macro
	 */
	public GetLogger <T> (__metadata__?: Modding.Generic<T, "id">): Logger {
		// TODO: Unscuff the below line.
		const Identifier = tostring([...[...__metadata__!.id.gmatch("@(.-)$")][0]][0]) ?? "Unknown"!;
		const StoredLogger = this.Loggers.get(__metadata__!.id);
		if (StoredLogger) return StoredLogger;

		const CreatedLogger = Logger.configure()
			.WriteTo({
				$MetaMenuLoggerService: this,
				Emit (event: LogEvent & LogAdditionalDetails) {
					this.$MetaMenuLoggerService.SendLog(event);
				}
			})
			.SetMinLogLevel(tonumber($env("MIN_LOG_LEVEL_SERVER") ?? "0") ?? 0)
			.WriteTo(Log.RobloxOutput({ Prefix: Identifier, }))
			.Create();

		this.Loggers.set(__metadata__!.id, CreatedLogger);

		return CreatedLogger;
	}

	/**
	 * Reteurns a logger that doesn't actually log anything.
	 */
	public VoidLogger <T> (properties: Omit<LogAdditionalDetails, "Identifier"> & Partial<Pick<LogAdditionalDetails, "Identifier">> = {}) {
		return LoggerService.VOID_LOGGER;
	}
}



import Log, { Logger } from "@rbxts/log";
import { $env } from "rbxts-transform-env";

Log.SetLogger(
	Logger.configure()
		.WriteTo(Log.RobloxOutput())
		.SetMinLogLevel($env<number>("LOGLEVEL_CLIENT") ?? 3)
		.Create()
);

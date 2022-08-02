import type { LogEvent } from "@rbxts/log";
import { DefinitionBuilder } from "@rbxts/netbuilder";
import { $terrify } from "rbxts-transformer-t";

export default new DefinitionBuilder("MetaMenuLogEvent")
	.SetArguments($terrify<LogEvent>())
	.Build();

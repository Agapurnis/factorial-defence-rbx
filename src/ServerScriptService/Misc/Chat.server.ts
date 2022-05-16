import type { ChatSpeaker} from "@rbxts/chat-service";
import { GetLuaChatService } from "@rbxts/chat-service";
import { DEVELOPERS } from "../../ReplicatedStorage/Utility/UserRanks";
import { Players } from "@rbxts/services";

const ChatService = GetLuaChatService();

/**
 * Applies various hard-coded chat cosmetics.
 */
function applyCosmetics (speaker: ChatSpeaker, name: string): void {
	if (DEVELOPERS.includes(Players.GetPlayers().find((p) => p.Name === name)?.UserId ?? 0)) {
		speaker.SetExtraData("Tags", [{ TagText: "Dev", TagColor: Color3.fromRGB(214, 135, 250) }]);
	}
}

ChatService.SpeakerAdded.Connect((name: string) => {
	const speaker = ChatService.GetSpeaker(name); if (!speaker) return;
	const player = speaker.GetPlayer(); if (!player) return;
	applyCosmetics(speaker, name);
});

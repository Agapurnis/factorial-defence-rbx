import { Controller } from "@flamework/core";
import { Workspace } from "@rbxts/services";
import Remotes from "ReplicatedStorage/Networking";

const DEBUG_SAVE_BUTTONS = Workspace
	.WaitForChild("TS")!
	.WaitForChild("DebugSaveButtons")! as Folder;

const DATA_DELETION_PROMPT = DEBUG_SAVE_BUTTONS.WaitForChild("ActivateToReset").FindFirstChildWhichIsA("ProximityPrompt")!;
const DATA_CLEAR_PROMPT = DEBUG_SAVE_BUTTONS.WaitForChild("ActivateToClear").FindFirstChildWhichIsA("ProximityPrompt")!;
const DATA_SAVE_PROMPT = DEBUG_SAVE_BUTTONS.WaitForChild("ActivateToSave").FindFirstChildWhichIsA("ProximityPrompt")!;

@Controller()
class DebugUserSaveDataButtonsController {
	constructor () {
		DATA_CLEAR_PROMPT.Triggered.Connect(() => {
			Remotes.DeleteUserData.Invoke(false).match(
				(res) => print(`Your data has been successfully cleared. Any new changes from this point will persist upon logout.`),
				(err) => print(`An error occured while attempting to clear your data. Try again in 10 seconds, or contact a developer. (err=${err})`)
			);
		});
		DATA_DELETION_PROMPT.Triggered.Connect(() => {
			Remotes.DeleteUserData.Invoke(true).match(
				(res) => print(`Your data has been successfully deleted. You will be logged out. Rejoining will cause a new user account to be created.`),
				(err) => print(`An error occured while attempting to delete your data. Try again in 10 seconds, or contact a developer. (err=${err})`)
			);
		});
		DATA_SAVE_PROMPT.Triggered.Connect(() => {
			Remotes.SaveUserData.Invoke().match(
				(res) => print(`Your data has been successfully been saved.`),
				(err) => print(`An error occured while attempting to save your data. Try again in 10 seconds. (err=${err})`)
			);
		});
	}
}

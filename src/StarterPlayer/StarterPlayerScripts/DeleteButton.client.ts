import Remotes from "ReplicatedStorage/Networking/Remotes"
import { refreshLocalUser } from "./State";

(game.Workspace.WaitForChild("Activate To Reset").WaitForChild("ProximityPrompt") as ProximityPrompt).Triggered.Connect(() => {
	Remotes.Client.User.DeleteUser.Call();
	refreshLocalUser()
})
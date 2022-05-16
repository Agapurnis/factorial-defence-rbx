import { MoneyDisplayBinding } from "./GUI/Overlay";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { Players } from "@rbxts/services";
import { User } from "ReplicatedStorage/Classes/User";
import Remotes from "ReplicatedStorage/Networking/Remotes";

function getUser () {
	const data = Remotes.Client.User.LoadUser.Call().unwrapOrElse(() => Remotes.Client.User.CreateUser.Call().expect("Could neither retrieve nor create user!"));
	const user = User.Deserialize(Players.LocalPlayer, data);

	MoneyDisplayBinding[1](user.money[Currency.FREE]);


	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore — This just makes it way easier for mini-scripts to do stuff if they aren't in TS.
	_G.LocalUser = user;

	return user;
}


export let LocalUser = getUser();
export function refreshLocalUser () { LocalUser = getUser(); }

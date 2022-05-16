import Remotes from "ReplicatedStorage/Networking/Remotes";
import { MoneyDisplayBinding } from "./Overlay";

Remotes.Client.Currency.InformUpdate.Connect((value) => {
	MoneyDisplayBinding[1](value);
});



import DataStore2 from "@rbxts/datastore2";
import { UserStoreKey } from "./UserStore";

export const MASTER_KEY = "Data";
export const DATASTORE_KEYS = [
	UserStoreKey
]

DataStore2.Combine(MASTER_KEY, ...DATASTORE_KEYS);

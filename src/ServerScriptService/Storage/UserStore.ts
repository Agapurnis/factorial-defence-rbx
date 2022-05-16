import type DataStore2 from "@rbxts/datastore2";
import type { UserData } from "ReplicatedStorage/Classes/User";

export const UserStoreKey = "User";
export const UserStores: Map<number, DataStore2<UserData>> = new Map();


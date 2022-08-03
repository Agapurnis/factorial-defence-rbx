import { ReplicatedStorage, RunService } from "@rbxts/services";

/**
 * In what scope a remote has it's callback executed in.
 */
export type NetworkScope = "Client" | "Server";
export type NetworkInvokableType = "Event" | "Function";

/**
 * Returns `V` if `T` extends `U`, otherwise `{}`.
 */
export type LockToScope <
	T extends NetworkScope,
	U extends NetworkScope,
	V
> = T extends U ? V : {};

/**
 * Override-add.
 */
export type OverrideAdd <T, U> = Omit<T, keyof U extends keyof T ? keyof U : never> & U;

/**
 * The folder where all remotes are stored.
 */
export const RemotesFolder = RunService.IsClient() ? ReplicatedStorage.WaitForChild("Remotes") : new Instance("Folder");
RemotesFolder.Name = "Remotes";
RemotesFolder.Parent = ReplicatedStorage;

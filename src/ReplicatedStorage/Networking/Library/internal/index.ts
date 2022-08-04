import { ReplicatedStorage, RunService } from "@rbxts/services";

/**
 * In what scope a remote has it's callback executed in.
 */
export type NetworkScope = "Client" | "Server";
export type NetworkInvokableType = "Event" | "Function";

/**
 * `P` - Spread parameter typings
 * `R` - Return type
 */
export type Function <P = unknown, R = unknown> = (...parameters: P[]) => R;

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

if (RunService.IsServer()) {
	RemotesFolder.Name = "Remotes";
	RemotesFolder.Parent = ReplicatedStorage;
}

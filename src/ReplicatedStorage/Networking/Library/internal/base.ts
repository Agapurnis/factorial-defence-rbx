import type { NetworkInvokableType, NetworkScope } from ".";
import type { Network } from "../";
import { RemotesFolder } from ".";
import { RunService } from "@rbxts/services";

type RemoteCallback = (...parameters: never[]) => void;

export interface NetworkInvokableSpecification <
	T extends NetworkScope = NetworkScope,
	U extends NetworkInvokableType = NetworkInvokableType,
	V extends RemoteCallback = RemoteCallback
> {
	IS_NETWORK_INVOKABLE_SPECIFICATION: true,
	/**
	 * **Does not exist at runtime.**
	 */
	FunctionType: V
	/**
 	 * Check to validate parameters.
	 */
	ParameterValidator: (args: unknown[]) => args is Parameters<T>
	/**
	 * Where the function is executed.
	 */
	Scope: T
	/**
	 * Whether this is an event or a function.
	 */
	Type: U
}

export abstract class NetworkInvokable <
	T extends NetworkScope = NetworkScope,
	U extends NetworkInvokableType = NetworkInvokableType,
	V extends RemoteCallback = RemoteCallback
> {
	/**
	 * The actual remote instance.
	 */
	protected readonly Remote: U extends "Function"
		? RemoteFunction
		: RemoteEvent;

	/**
	 * The callback that the remote is using, if defined.
	 */
	protected Callback?: T extends "Server" ? (player: Player, ...parameters: Parameters<V>) => ReturnType<V> : V;

	/**
	 * The class instance with traited methods typed.
	 *
	 * @hidden
	 * @deprecated
	 */
	public readonly abstract __with_methods__: unknown;

	constructor (
		protected readonly Specification: NetworkInvokableSpecification<T, U, V>,
		protected readonly Network: Network,
		protected readonly Name: string,
	) {
		if (RunService.IsServer()) {
			this.Remote = (Specification.Type === "Function"
				? new Instance("RemoteFunction")
				: new Instance("RemoteEvent")
			) as U extends "Function"
				? RemoteFunction
				: RemoteEvent;

			this.Remote.Name = Name;
			this.Remote.Parent = RemotesFolder;
		} else {
			this.Remote = RemotesFolder.WaitForChild(Name) as U extends "Function"
				? RemoteFunction
				: RemoteEvent;
		}
	}
}

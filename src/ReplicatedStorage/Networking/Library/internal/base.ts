import type { NetworkInvokableType, NetworkScope, Function } from ".";
import type { Network } from "../";
import { RemotesFolder } from ".";
import { RunService } from "@rbxts/services";

type RemoteCallback = Function<never>;

/**
 * The class used to describe a remote function or event.
 */
export class NetworkInvokableSpecification <
	T extends NetworkScope = NetworkScope,
	U extends NetworkInvokableType = NetworkInvokableType,
	V extends RemoteCallback = RemoteCallback
> {
	/**
	 * The validators for callback parameters and return types.
	 */
	public readonly Validators: {
		ParameterTypeValidator: (parameters: unknown[]) => parameters is Parameters<V>,
		ReturnTypeValidator: U extends "Event" ? never : (value: unknown) => value is ReturnType<V>
	};

	constructor (
		/**
		 * Where the function is executed.
		 */
		public readonly Scope: T,
		/**
		 * Whether this is an event or a function.
		 */
		public readonly Type: U,
		/**
		 * The validators for callback parameters and return types.
		 */
		Validators?: {
			ParameterTypeValidator?: (parameters: unknown[]) => parameters is Parameters<V>,
			ReturnTypeValidator?: U extends "Event" ? never : (value: unknown) => value is ReturnType<V>
		}
	) {
		const FallbackParameterTypeValidator = (parameters: unknown[]): parameters is Parameters<V> => true;
		const FallbackReturnTypeValidator = (this.Type === "Event" ? undefined as never : (value: unknown): value is ReturnType<V> => true) as U extends "Event" ? never : (value: unknown) => value is ReturnType<V>;
		this.Validators = (Validators ?? {}) as typeof this.Validators;
		this.Validators.ParameterTypeValidator ??= FallbackParameterTypeValidator;
		this.Validators.ReturnTypeValidator ??= FallbackReturnTypeValidator;
	}
}

/**
 * The base class a remote wrawpper should extend.
 */
export abstract class NetworkInvokable <
	T extends NetworkScope = NetworkScope,
	U extends NetworkInvokableType = NetworkInvokableType,
	V extends RemoteCallback = RemoteCallback
> {
	/**
	 * The actual remote instance.
	 */
	public readonly Remote: U extends "Function"
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
		public readonly Name: string,
	) {
		type Remote = U extends "Function" ? RemoteFunction : RemoteEvent;

		if (RunService.IsClient()) {
			// The remote is created on the server, so wait for it to be initialized.
			this.Remote = RemotesFolder.WaitForChild(Name) as Remote;
		} else {
			this.Remote = (Specification.Type === "Function"
				? new Instance("RemoteFunction")
				: new Instance("RemoteEvent")
			) as Remote;

			this.Remote.Name = Name;
			this.Remote.Parent = RemotesFolder;
		}
	}
}

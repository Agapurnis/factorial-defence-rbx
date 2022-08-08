import type { LockToScope, NetworkScope, OverrideAdd, Function } from ".";
import { NetworkInvokable } from "./base";
import { RunService } from "@rbxts/services";

export type RemoteEventCallback = Function<never>;

// #region Methods
interface ServerSetCallback <T extends RemoteEventCallback> {
	/**
	 * @server
	 */
	SetCallback (callback: (player: Player, ...parameters: Parameters<T>) => ReturnType<T>): void
}
interface ClientSetCallback <T extends RemoteEventCallback> {
	/**
	 * Any behavior here is *not guaranteed* to be actually executed.
	 *
	 * @client
	 */
	SetCallback (callback: (...parameters: Parameters<T>) => ReturnType<T>): void
}
interface ServerFireMethods <T extends RemoteEventCallback> {
	/**
	 * @server
	 */
	Invoke (player: Player, ...parameters: Parameters<T>): ReturnType<T>
}
interface ClientFireMethods <T extends RemoteEventCallback> {
	/**
	 * @client
	 */
	Invoke (...parameters: Parameters<T>): ReturnType<T>
}
// #endregion Methods

/**
 * A wrapper for a `RemoteEvent`.
 */
export class NetworkEvent <
	T extends NetworkScope,
	U extends RemoteEventCallback
> extends NetworkInvokable<T, "Event", U> {
	/**
	 * The class instance with traited methods typed.
	 *
	 * @hidden
	 * @deprecated
	 */
	public __with_methods__= this as unknown as OverrideAdd<typeof this,
		& LockToScope<"Server", T, ServerSetCallback<U>>
		& LockToScope<"Client", T, ClientSetCallback<U>>
		& LockToScope<"Client", T, ServerFireMethods<U>>
		& LockToScope<"Server", T, ClientFireMethods<U>>
	>;

	/**
	 * - @see {@link ServerFireMethods.Invoke|Server Invocation} for invocation from the server and execution on the client.
	 * - @see {@link ClientFireMethods.Invoke|Client Invocation} for invocation from the client and execution on the server.
	 */
	private Invoke (...parameters: T extends "Server" ? [player: Player, ...parameters: Parameters<U>] : Parameters<U>): ReturnType<U> {
		if (
			(RunService.IsClient() && this.Specification.Scope === "Server") ||
			(RunService.IsServer() && this.Specification.Scope === "Client")
		) throw `Attempted to invoke on the wrong scope! (${this.Name})`;

		if (this.Network.Configuration.ShouldValidatePriorToSending() && !this.Specification.Validators.ParameterTypeValidator(parameters)) {
			this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ParametersType");
		}


		const player = (this.Specification.Scope === "Server" ? parameters.pop() as Player : undefined) as T extends "Server" ? Player : undefined;
		const serialized = this.Network.Serialize(parameters) as [never];

		if (this.Specification.Scope === "Client") {
			return this.Remote.FireServer(...serialized) as ReturnType<U>;
		}

		if (this.Specification.Scope === "Server") {
			return this.Remote.FireClient(player!, ...serialized) as ReturnType<U>;
		}

		throw `Network event prediction is only available on the server! (${this.Name})`;
	}

	/**
	 * {@inheritDoc ServerSetCallback.SetCallback}
	 */
	private SetCallback (callback: Exclude<typeof this.Callback, undefined>): void {
		if (
			(RunService.IsClient() && this.Specification.Scope === "Server") ||
			(RunService.IsServer() && this.Specification.Scope === "Client")
		) throw `Attempted to set a callback on the wrong scope! (${this.Name})`;

		if (this.Callback !== undefined) {
			throw `Attempted to set a callback twice! (${this.Name})`;
		}

		this.Callback = callback;

		if (RunService.IsClient()) {
			this.Remote.OnClientEvent.Connect((...parameters) => {
				assert(this.Callback, "callback is undefined despite being defined earlier!");

				const deserialized = this.Network.Deserialize(parameters) as [never];

				if (this.Specification.Validators.ParameterTypeValidator(deserialized)) {
					// Even if the server doesn't meet the critera we'll attempt to salvage things by trusting the server and running the callback.
					this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ParametersType");
				}

				this.Callback(...deserialized);
			});
		}	else {
			this.Remote.OnServerEvent.Connect((player, ...parameters: unknown[]) => {
				assert(this.Callback, "callback is undefined despite being defined earlier!");

				const deserialized = this.Network.Deserialize(parameters) as [never];

				if (this.Specification.Validators.ParameterTypeValidator(deserialized)) {
					// We just won't fire the callback if it doesn't meet the criteria.
					return this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ParametersType");
				}

				this.Callback(player as never, ...deserialized);
			});
		}
	}
}


import type { LockToScope, NetworkScope, OverrideAdd } from ".";
import { NetworkInvokable } from "./base";
import { RunService } from "@rbxts/services";

export type RemoteFunctionCallback = (...parameters: never[]) => unknown;

// #region Methods
interface ServerPredictable <T extends RemoteFunctionCallback> {
	/**
	 * @server
	 */
	Predict (player: Player, ...parameters: Parameters<T>): ReturnType<T>
}
interface ServerSetCallback <T extends RemoteFunctionCallback> {
	/**
	 * @server
	 */
	SetCallback (callback: (player: Player, ...parameters: Parameters<T>) => ReturnType<T>): void
}
interface ServerFireMethods <T extends RemoteFunctionCallback> {
	/**
	 * @server
	 */
	Invoke (player: Player, ...parameters: Parameters<T>): ReturnType<T>
}
interface ClientFireMethods <T extends RemoteFunctionCallback> {
	/**
	 * @client
	 */
	Invoke (...parameters: Parameters<T>): ReturnType<T>
}
// #endregion Methods

/**
 *
 */
export class NetworkFunction <
	T extends NetworkScope,
	V extends RemoteFunctionCallback
> extends NetworkInvokable<T, "Function", V> {
	/**
	 * The class instance with traited methods typed.
	 *
	 * @hidden
	 * @deprecated
	 */
	public __with_methods__= this as unknown as OverrideAdd<typeof this,
		& LockToScope<"Server", T, ServerSetCallback<V>>
		& LockToScope<"Server", T, ServerPredictable<V>>
		& LockToScope<"Client", T, ServerFireMethods<V>>
		& LockToScope<"Server", T, ClientFireMethods<V>>
	>;

	/**
	 * @see {@link Predictable.Predict}
	 * ---
	 * {@inheritdoc Predictable.Predict}
	 */
	private Predict (player: Player, ...parameters: Parameters<V>): ReturnType<V> {
		if (RunService.IsClient()) {
			throw "Network event prediction is only available on the server!";
		}

		if (this.Specification.Scope === "Client") {
			throw "Cannot predict a client function!";
		}

		if (this.Callback === undefined) {
			throw "Callback not registered!";
		}

		return (this.Callback as (player: Player, ...parameters: Parameters<V>) => ReturnType<V>)(player, ...parameters);
	}

	/**
	 * @see {@link ServerFireMethods.Invoke}
	 * @see {@link ClientFireMethods.Invoke}
	 * ---
	 * {@inheritdoc ServerFireMethods.Invoke}
	 * {@inheritdoc ClientFireMethods.Invoke
	 */
	private Invoke (...parameters: T extends "Server" ? [player: Player, ...parameters: Parameters<V>] : Parameters<V>): ReturnType<V> {
		if (this.Specification.Scope === "Client") {
			throw `Client functions aren't currently supported! (${this.Name})`;
		}

		if (this.Specification.Scope === "Server") {
			if (RunService.IsServer()) {
				throw `Attempted to invoke a server function on the server! Did you mean to use 'Predict'? (${this.Name})`;
			}

			return this.Network.Deserialize(this.Remote.InvokeServer(...(this.Network.Serialize(parameters) as [never]))) as ReturnType<V>;
		}

		throw `Network event prediction is only available on the server! (${this.Name})`;
	}

	/**
	 * @see {@link ServerSetCallback.SetCallback}
	 * ---
	 * {@inheritdoc ServerSetCallback.SetCallback}
	 */
	private SetCallback (callback: typeof this.Callback): void {
		if (
			(RunService.IsClient() && this.Specification.Scope === "Server") ||
			(RunService.IsServer() && this.Specification.Scope === "Client")
		) {
			throw `Attempted to set a callback on the wrong scope! (${this.Name})`;
		}

		if (this.Callback !== undefined) {
			throw `Attempted to set a callback twice! (${this.Name})`;
		}

		this.Callback = callback;

		if (RunService.IsClient()) {
			throw `Client functions aren't currently supported! (${this.Name})`;
		}	else {
			this.Remote.OnServerInvoke = (...data: unknown[]) => {
				assert(this.Callback); return this.Network.Serialize(this.Callback(...(this.Network.Deserialize(data) as [never])));
			};
		}
	}
}


import type { LockToScope, NetworkScope, OverrideAdd } from ".";
import { NetworkInvokable } from "./base";
import { RunService } from "@rbxts/services";

export type RemoteEventCallback = (...parameters: never[]) => void;

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
	Invoke (player: Player, ...parameters: Parameters<T>): ReturnType<T>
}
// #endregion Methods

export class NetworkEvent <
	T extends NetworkScope,
	V extends RemoteEventCallback
> extends NetworkInvokable<T, "Event", V> {
	/**
	 * The class instance with traited methods typed.
	 *
	 * @hidden
	 * @deprecated
	 */
	public __with_methods__= this as unknown as OverrideAdd<typeof this,
		& LockToScope<"Server", T, ServerSetCallback<V>>
		& LockToScope<"Client", T, ClientSetCallback<V>>
		& LockToScope<"Client", T, ServerFireMethods<V>>
		& LockToScope<"Server", T, ClientFireMethods<V>>
	>;

	/**
	 * @see {@link ServerFireMethods.Invoke}
	 * @see {@link ClientFireMethods.Invoke}
	 * ---
	 * {@inheritdoc ServerFireMethods.Invoke}
	 * {@inheritdoc ClientFireMethods.Invoke
	 */
	private Invoke (...parameters: T extends "Server" ? [player: Player, ...parameters: Parameters<V>] : Parameters<V>): ReturnType<V> {
		if (this.Specification.Scope === "Client") {
			if (RunService.IsServer()) {
				throw `Attempted to invoke a client event on the client! (${this.Name})`;
			}

			return this.Remote.FireServer(...(this.Network.Serialize(parameters)) as [never]) as ReturnType<V>;
		}

		if (this.Specification.Scope === "Server") {
			if (RunService.IsServer()) {
				throw `Attempted to invoke a server event on the server! (${this.Name})`;
			}

			return this.Remote.FireClient(...(this.Network.Serialize(parameters)) as [never]) as ReturnType<V>;
		}

		throw `Network event prediction is only available on the server! (${this.Name})`;
	}

	/**
	 * @see {@link ServerSetCallback.SetCallback}
	 * ---
	 * {@inheritdoc ServerSetCallback.SetCallback}
	 */
	private SetCallback (callback: Exclude<typeof this.Callback, undefined>): void {
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
			this.Remote.OnServerEvent.Connect((player, ...data: unknown[]) => {
				assert(this.Callback); this.Callback(player as never, ...(this.Network.Deserialize(data) as [never]));
			});
		}	else {
			this.Remote.OnClientEvent.Connect((...data) => {
				assert(this.Callback); this.Callback(...(this.Network.Deserialize(data) as [never]));
			});
		}
	}
}


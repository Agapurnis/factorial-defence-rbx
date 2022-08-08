import type { LockToScope, NetworkScope, OverrideAdd, Function } from ".";
import { NetworkInvokable } from "./base";
import { RunService } from "@rbxts/services";

export type RemoteFunctionCallback <R = unknown> = Function<never, R>;

// #region Methods
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
 * A wrapper for a `RemoteFunction`.
 */
export class NetworkFunction <
	T extends NetworkScope,
	U extends RemoteFunctionCallback
> extends NetworkInvokable<T, "Function", U> {
	/**
	 * The class instance with traited methods typed.
	 *
	 * @hidden
	 * @deprecated
	 */
	public __with_methods__= this as unknown as OverrideAdd<typeof this,
		& LockToScope<"Server", T, ServerSetCallback<U>>
		& LockToScope<"Client", T, ServerFireMethods<U>>
		& LockToScope<"Server", T, ClientFireMethods<U>>
	>;

	/**
	 * - @see {@link ServerFireMethods.Invoke|Server Invocation} for invocation from the server and execution on the client.
	 * - @see {@link ClientFireMethods.Invoke|Client Invocation} for invocation from the client and execution on the server.
	 * ---
	 * @remarks
	 *  - Client function invocation is currently disabled.
	 */
	private Invoke (...parameters: T extends "Server" ? [player: Player, ...parameters: Parameters<U>] : Parameters<U>): ReturnType<U> {
		if (this.Specification.Scope === "Client") {
			throw `Client functions aren't currently supported! (${this.Name})`;
		}

		if (this.Specification.Scope === "Server") {
			if (RunService.IsServer()) {
				throw `Attempted to invoke a server function on the server! Did you mean to use 'Predict'? (${this.Name})`;
			}

			const serialized = this.Network.Serialize(parameters) as [never];

			if (this.Network.Configuration.ShouldValidatePriorToSending() && !this.Specification.Validators.ParameterTypeValidator(serialized)) {
				return this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ParametersType") as ReturnType<U>;
			}

			const result = this.Network.Deserialize(this.Remote.InvokeServer(...serialized)) as ReturnType<U>;

			if (this.Network.Configuration.ShouldValidatePriorToSending() && !this.Specification.Validators.ReturnTypeValidator(result)) {
				return this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ReturnType") as ReturnType<U>;
			}

			return result;
		}

		throw `Network event prediction is only available on the server! (${this.Name})`;
	}

	/**
	 * {@inheritDoc ServerSetCallback.SetCallback}
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
			this.Remote.OnServerInvoke = (player: Player, ...parameters: unknown[]) => {
				assert(this.Callback, "callback does not exist despite previous check!");

				const deserialized = this.Network.Deserialize(parameters) as [never];

				if (!this.Specification.Validators.ParameterTypeValidator(deserialized)) {
					print(1);
					print(deserialized);
					return this.Network.Serialize(this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ParametersType"));
				}

				const result = this.Callback(player as never, ...deserialized);

				if (this.Network.Configuration.ShouldValidateReturnType() && !this.Specification.Validators.ReturnTypeValidator(result)) {
					print(2);
					print(result);
					return this.Network.Serialize(this.Network.Configuration.OnTypeError(this as NetworkInvokable, "ReturnType"));
				}

				return this.Network.Serialize(result);
			};
		}
	}
}


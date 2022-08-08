import type { NetworkInvokable } from "./base";
import { RunService } from "@rbxts/services";

export type PartialNetworkConfiguration = RecursivePartial<NetworkConfiguration>;

export interface NetworkConfiguration {
	ShouldValidatePriorToSending (): boolean;
	ShouldValidateReturnType (): boolean;
	OnTypeError (invokable: NetworkInvokable, type: "ParametersType" | "ReturnType"): void;
}

function recursiveFillTemplate <T> (left: RecursivePartial<T>, right: T): T {
	if (typeIs(left, "nil")) return right;
	if (!typeIs(left, "table") || !typeIs(right, "table")) return left as T;

	for (const [key, value] of pairs(right)) {
		left[key as never] = recursiveFillTemplate(left[key as never], value as never);
	}

	return left as T;
}

export const FillConfigurationTemplate = recursiveFillTemplate;
export const DefaultNetworkConfiguration: NetworkConfiguration = {
	ShouldValidatePriorToSending() { return !RunService.IsStudio(); },
	ShouldValidateReturnType() { return RunService.IsStudio(); },

	OnTypeError (remote) {
		warn(`Type error in remote '${remote.Name}'!`);

		return undefined;
	}
};

type RecursivePartial <T> = { [K in keyof T]?: T[K] extends Record<string | number | symbol, unknown> ? RecursivePartial<T[K]> : T[K] };


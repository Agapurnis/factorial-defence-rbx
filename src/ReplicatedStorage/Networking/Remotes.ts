import { Option, Result } from "@rbxts/rust-classes";
import type { ItemMovementError } from "ReplicatedStorage/Enums/Errors/ItemMovementError";
import type { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import { GenericError } from "../Enums/GenericError";
import { OptionSerializer } from "./Serializers/Option";
import { ResultSerializer } from "./Serializers/Result";
import { $terrify } from "rbxts-transformer-t";
import { Network } from "./Library";

const Remotes = new Network({
	OnTypeError (remote) {
		warn(`Type error in remote '${remote.Name}'!`);

		return Result.err(GenericError.UNKNOWN_INTERNAL_SERVER_ERROR);
	}
})
	.AddSerde([Result, ResultSerializer])
	.AddSerde([Option, OptionSerializer])
	.Build({
		StartMovingItems: Network.ServerFunction<(uuids: string[]) => Array<Result<true, GenericError>>>($terrify<[uuids: string[]]>()),

		CreateItems: Network.ServerFunction<(uuids: string[]) => Array<Result<string, GenericError | ItemMovementError>>>($terrify<[uuids: string[]]>()),
		PlaceItems: Network.ServerFunction<(items: Array<[uuid: string, cframe: CFrame]>) => Array<Result<CFrame, GenericError | ItemMovementError>>>($terrify<[items: Array<[uuid: string, cframe: CFrame]>]>()),

		DeleteUserData: Network.ServerFunction<(full: boolean) => Result<true, UserDataServiceError | GenericError>>($terrify<[full: boolean]>()),
		SaveUserData: Network.ServerFunction<() => Result<true, UserDataServiceError | GenericError>>(),
	});

export { Remotes };

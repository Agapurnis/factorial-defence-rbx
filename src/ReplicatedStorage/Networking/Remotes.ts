import { Option, Result } from "@rbxts/rust-classes";
import type { ItemMovementError } from "ReplicatedStorage/Enums/Errors/ItemMovementError";
import type { UserDataServiceError } from "ReplicatedStorage/Enums/Errors/UserDataServiceError";
import type { GenericError } from "./GenericError";
import { OptionSerializer } from "./Serializers/Option";
import { ResultSerializer } from "./Serializers/Result";
import { Network } from "./Library";

const Remotes = new Network()
	.AddSerde([Result, ResultSerializer])
	.AddSerde([Option, OptionSerializer])
	.Build({
		StartMovingItems: Network.ServerFunction<(uuids: string[]) =>  Array<Result<true, GenericError>>>(),
		CreateItems: Network.ServerFunction<(uuids: string[]) => Array<Result<string, GenericError | ItemMovementError>>>(),
		PlaceItems: Network.ServerFunction<(items: Array<[uuid: string, cframe: CFrame]>) => Array<Result<CFrame, GenericError | ItemMovementError>>>(),

		DeleteUserData: Network.ServerFunction<(full: boolean) => Result<true, UserDataServiceError | GenericError>>(),
		SaveUserData: Network.ServerFunction<() => Result<true, UserDataServiceError | GenericError>>(),
	});

export { Remotes };

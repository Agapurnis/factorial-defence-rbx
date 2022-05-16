import { CollectionService } from "@rbxts/services";
import { ItemPurchaseError } from "ReplicatedStorage/Networking/Definitions/Item/PurchaseItem";
import { Item, ItemData } from "ReplicatedStorage/Classes/Item"
import { UserRepository } from "../User/UserRepository";
import { ItemRepository } from "../Item/ItemRepository";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { Result } from "@rbxts/rust-classes";
import Remotes from "ReplicatedStorage/Networking/Remotes";
import { ItemRegistry } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { UserStores } from "ServerScriptService/Storage/UserStore";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

export function createItem (player: Player, register: string): Result<ItemData, GenericError> {
	const user = UserRepository.get(player);
	if ((user.isNone() === true)) return Result.err(GenericError.NotFound);
	if ((user.unwrap().inventory.count[register]) === undefined) return Result.err(GenericError.NotFound);
	if ((user.unwrap().inventory.count[register] ?? 0) < 1) return Result.err(GenericError.Forbidden);
	const item = new Item(user.unwrap(), register); item.enabled = false;

	user.unwrap().inventory.count[item.registerID] -= 1;
	user.unwrap().inventory.items[item.instanceID] = item;
	ItemRepository.set(item.instanceID, item);

	Remotes.Server.Item.InformInventoryUpdate.Send(player, [[item.registerID, user.unwrap().inventory.count[item.registerID]!]]);

	return Result.ok(item.Serialize())
}

export function purchaseItem (player: Player, register: string): Result<true, GenericError | ItemPurchaseError> {
	const user = UserRepository.get(player);
	const item = ItemRegistry[register]
	if (item === undefined) return Result.err(GenericError.NotFound)
	if (item.price[ExchangeType.PURCHASE]?.[Currency.FREE] === undefined) return Result.err(ItemPurchaseError.CannotPurchase);
	if (user.isNone() === true) return Result.err(GenericError.NotFound);
	if (user.unwrap().money[Currency.FREE] < item.price[ExchangeType.PURCHASE]![Currency.FREE]!) return Result.err(ItemPurchaseError.NotEnoughMoney);
	const u = user.unwrap();

	u.inventory.count[register] ??= 0;
	u.inventory.count[register]  += 1;
	u.money[Currency.FREE] -= item.price[ExchangeType.PURCHASE]![Currency.FREE]!

	Remotes.Server.Item.InformInventoryUpdate.Send(player, [[register, u.inventory.count[register]!]]);
	Remotes.Server.Currency.InformUpdate.Send(player, u.money[Currency.FREE]);

	return Result.ok(true)
}

export function placeItem (player: Player, id: string, cframe: CFrame): Result<true, GenericError> {
	if (!ItemRepository.has(id)) return Result.err(GenericError.NotFound);
	if (!ItemRepository.InMovement.has(id)) return Result.err(GenericError.Invalid);

	const item = ItemRepository.get(id).unwrap();

	if (item.user.player.UserId !== player.UserId)
		return Result.err(GenericError.Forbidden);

	const previous = item.model.GetPivot()
	const overlap = new OverlapParams();
	overlap.FilterDescendantsInstances = [game.Workspace.FindFirstChild("Baseplate") as Instance];
	overlap.FilterType = Enum.RaycastFilterType.Blacklist;

	if (cframe.X % 1 !== 0 || cframe.Z % 1 !== 0) {
		return Result.err(GenericError.Invalid);
	}

	const rounded = cframe.ToOrientation().map((e) => math.rad(math.round(math.deg(e) / 90 * 90)));
	const rotation = CFrame.fromEulerAnglesYXZ(rounded[0], rounded[1], rounded[2]);
	// Override cframe rotation with the safeguarded one.
	cframe = new CFrame(cframe.Position).mul(rotation)

	item.model.PivotTo(cframe);
	const region = new ComplexRegion(item.model, (part) => !(part.GetAttribute("DoesNotBlockPlacement") as boolean ?? false));

	if (region.FindPartsInRegion(overlap, (part) => {
		const doesNotBlockPlacement = part.GetAttribute("DoesNotBlockPlacement") as boolean ?? false;
		const isOre = CollectionService.HasTag(part, Tag.Ore);
		return !isOre && !doesNotBlockPlacement;
	}).size() > 0) {
		item.model.PivotTo(previous);
		return Result.err(GenericError.Invalid)
	}

	item.enabled = true;
	ItemRepository.InMovement.delete(id)
	ItemRepository.set(item.instanceID, item)
	UserStores.get(player.UserId)!.Set(item.user.serialize())

	return Result.ok(true)
}

export function moveItem (player: Player, id: string): Result<true, GenericError> {
	const item = ItemRepository.get(id);
	if (item.isNone()) return Result.err(GenericError.NotFound);
	if (item.unwrap().user.player.UserId !== player.UserId) return Result.err(GenericError.Forbidden);

	ItemRepository.InMovement.add(id);
	item.unwrap().enabled = false;

	return Result.ok(true)
}

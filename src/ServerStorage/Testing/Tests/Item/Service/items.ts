import { ItemRegisterList } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

function getItemBetweenPrices (min: number, max: number): typeof ItemRegisterList[number] | undefined {
	return ItemRegisterList.find(({ price }) => (price[ExchangeType.PURCHASE]?.[Currency.FREE] ?? 0) < max && (price[ExchangeType.PURCHASE]?.[Currency.FREE] ?? 0) > min)
}

const ITEM_BELOW_28500_ABOVE_20000 = getItemBetweenPrices(20_000, 28_500)!
const ITEM_BELOW_500_ABOVE_5 = getItemBetweenPrices(5, 500)!

if (
	!ITEM_BELOW_28500_ABOVE_20000 ||
	!ITEM_BELOW_500_ABOVE_5
) throw "Could not find items to test with!";

export {
	ITEM_BELOW_28500_ABOVE_20000,
	ITEM_BELOW_500_ABOVE_5
}

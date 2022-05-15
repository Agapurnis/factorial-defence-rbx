import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.FURNACE], "99083183-5c76-4c99-9274-d18d7c806377",{
	name: "Basic Furnace",
	sell (ore, _, user) {
		user.money[Currency.FREE] += ore.worth[Currency.FREE];
		user.money[Currency.PAID] += ore.worth[Currency.PAID];
	},

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 1,
		}
	},
})

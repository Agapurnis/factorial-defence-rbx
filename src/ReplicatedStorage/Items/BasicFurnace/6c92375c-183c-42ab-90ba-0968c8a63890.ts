import { Currency } from "ReplicatedStorage/Enums/Currency";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

export = RegisterItem([ItemTraitEnum.FURNACE], script, {
	name: "Basic Furnace",

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	},

	sell (ore, item) {
		for (const [currency] of pairs(Currency)) {
			item.Owner.attributes[`Balance_${currency}`] += ore.attributes[`Value_${currency}`];
		}
	}
});

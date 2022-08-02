import { Currency } from "ReplicatedStorage/Enums/Currency";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

export = RegisterItem([ItemTraitEnum.CONVEYOR], script, {
	name: "High-grade Conveyor",
	speed: 18.5,

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	}
});

import { Currency } from "ReplicatedStorage/Enums/Currency";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

export = RegisterItem([ItemTraitEnum.CONVEYOR], script, {
	name: "Straight Mini Conveyor",
	speed: 10,

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	}
});

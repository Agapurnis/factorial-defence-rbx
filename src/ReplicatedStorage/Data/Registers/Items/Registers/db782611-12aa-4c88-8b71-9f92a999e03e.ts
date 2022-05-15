import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.CONVEYOR], "db782611-12aa-4c88-8b71-9f92a999e03e", {
	name: "Straight Mini conveyor.",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 3,
		}
	},
})

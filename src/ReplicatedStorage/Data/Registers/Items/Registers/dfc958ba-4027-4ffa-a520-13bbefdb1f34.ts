import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

// High grade conveyor.

export = RegisterItem([ItemTraitEnum.CONVEYOR], "dfc958ba-4027-4ffa-a520-13bbefdb1f34", {
	name: "High-Grade Conveyor",
	speed: 10,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 10,
		}
	},
})

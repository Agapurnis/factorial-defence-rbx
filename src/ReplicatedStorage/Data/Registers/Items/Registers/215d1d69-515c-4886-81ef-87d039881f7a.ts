import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.CONVEYOR], "215d1d69-515c-4886-81ef-87d039881f7a", {
	name: "Sideways Mini Conveyor",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 3,
		}
	},
})

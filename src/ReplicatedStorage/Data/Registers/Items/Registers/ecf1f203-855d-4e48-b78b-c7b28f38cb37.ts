import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.CONVEYOR], "ecf1f203-855d-4e48-b78b-c7b28f38cb37",{
	name: "Walled Conveyor",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 7,
		}
	},
})

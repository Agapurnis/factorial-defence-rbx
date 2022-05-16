import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.CONVEYOR], "166835c7-66a0-4efb-9d96-5b614fbb39c1", {
	name: "Basic Conveyor",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 2,
		}
	},
});

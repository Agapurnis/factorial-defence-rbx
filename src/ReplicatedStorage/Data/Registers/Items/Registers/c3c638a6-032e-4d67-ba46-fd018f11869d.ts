import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { RegisterItem } from "../ItemRegister";

export = RegisterItem([], "c3c638a6-032e-4d67-ba46-fd018f11869d", {
	name: "???",
	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 100,
		}
	},
});

import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

export = RegisterItem([ItemTraitEnum.CONVEYOR, ItemTraitEnum.UPGRADER], "1eda3616-f7c6-43fc-837f-279dc35cb11c", {
	name: "Basic Upgrader",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 5,
		}
	},

	upgrade (ore, item) {
		const debounce = 1.000;
		const recorded = ore.upgrades.map.get(item.instanceID) ?? [[undefined!, 0]];
		if ((recorded[recorded.size() - 1][1] ?? 0) + debounce > (game.Workspace.GetServerTimeNow())) return;

		ore.worth[Currency.FREE] += 1;
		ore.updateText();
	}
});

import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

export = RegisterItem([ItemTraitEnum.CONVEYOR, ItemTraitEnum.UPGRADER], "8c9bfeb9-8fe8-49f0-9ce6-7c03def0469d", {
	name: "Skoggler",
	speed: 13.37,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 25000,
		}
	},

	upgrade (ore, item) {
		const debounce = 1.000;
		const recorded = ore.upgrades.map.get(item.instanceID) ?? [[undefined!, 0]];
		if ((recorded[recorded.size() - 1][1] ?? 0) + debounce > (game.Workspace.GetServerTimeNow())) return;

		ore.worth[Currency.FREE] += math.random(10, 1000);
		ore.updateText();
	}
});

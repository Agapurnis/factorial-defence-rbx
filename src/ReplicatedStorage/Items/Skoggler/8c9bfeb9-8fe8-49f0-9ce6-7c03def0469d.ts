import { Currency } from "ReplicatedStorage/Enums/Currency";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

export = RegisterItem([ItemTraitEnum.CONVEYOR, ItemTraitEnum.UPGRADER], script, {
	name: "Skoggler",
	speed: 13.37,

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	},

	upgrade (ore, item) {
		const debounce = 1.000;
		const recorded = ore.Upgrades.map.get(item.attributes.ItemInstanceUUID) ?? [[undefined!, 0]];
		if ((recorded[recorded.size() - 1][1] ?? 0) + debounce > (game.Workspace.GetServerTimeNow())) return;
		ore.attributes["Value_CREDITS"] *= 2;
	}
});

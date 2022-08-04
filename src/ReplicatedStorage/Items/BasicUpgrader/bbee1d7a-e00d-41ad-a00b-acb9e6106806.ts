import { Currency } from "ReplicatedStorage/Enums/Currency";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

export = RegisterItem([ItemTraitEnum.UPGRADER, ItemTraitEnum.CONVEYOR], script, {
	name: "Basic Upgrader",
	speed: 10,

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	},

	upgrade (ore, item) {
		const debounce = 1.000;
		const recorded = ore.Upgrades.map.get(item.attributes.ItemInstanceUUID) ?? [[undefined!, 0]];
		if ((recorded[recorded.size() - 1][1] ?? 0) + debounce > (game.Workspace.GetServerTimeNow())) return;
		ore.attributes["Value_CREDITS"] += math.random(2, 5);
	}
});

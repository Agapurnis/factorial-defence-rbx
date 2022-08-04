import type { OreService } from "ServerScriptService/Services/OreService";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import { Dependency } from "@flamework/core";
import { RegisterItem } from "ReplicatedStorage/Items/ItemRegister";
import { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import { PricingExchangeType } from "ReplicatedStorage/Enums/PricingExchangeType";

const DroppedOre = new Instance("Part");
DroppedOre.Name = "DraperOre";
DroppedOre.Size = new Vector3(1, 1, 1);

export = RegisterItem([ItemTraitEnum.DROPPER], script, {
	name: "Draper",
	dropSpeed: 500,

	price: {
		[PricingExchangeType.BUY]: {
			[Currency.CREDITS]: 0,
		}
	},

	drop (item) {
		return Dependency<OreService>().CreateOre(DroppedOre, item, {
			[Currency.CREDITS]: 10,
		});
	}
});

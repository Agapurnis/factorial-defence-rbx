import { CollectionService } from "@rbxts/services";
import { Timer } from "@rbxts/timer";
import { Ore } from "ReplicatedStorage/Classes/Ore";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";

export = RegisterItem([ItemTraitEnum.DROPPER], "29334d27-0f14-4fc7-ba5d-ca9761d587dc", {
	name: "El Draper",

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 20,
		}
	},

	timer: () => new Timer(0.5),
	drop (item) {
		// TODO: Cache.
		const origin = item.model.GetDescendants().filter((descendant) => CollectionService.HasTag(descendant, Tag.Dropper))[0] as Part;
		const part = new Instance("Part");
		part.Size = new Vector3(1, 1, 1);
		part.Parent = game.Workspace;
		part.Position = origin.Position.add(new Vector3(0, origin.Size.Y / 2, 0));
		return new Ore(part, item, {
			[Currency.FREE]: 5,
			[Currency.PAID]: 0,
		});
	}
});

import { Ore } from "ReplicatedStorage/Classes/Ore";
import { Timer } from "@rbxts/timer";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import { RegisterItem } from "../ItemRegister";
import { ItemTraitEnum } from "../ItemTrait";
import { CollectionService } from "@rbxts/services";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";

export = RegisterItem([ItemTraitEnum.DROPPER, ItemTraitEnum.CONVEYOR], "c3848930-b3b3-46d8-9818-076df148ba19", {
	name: "The Shmeggle",
	speed: 5,

	price: {
		[ExchangeType.PURCHASE]: {
			[Currency.FREE]: 1,
		}
	},

	timer: () => new Timer(0.5),
	drop (item) {
		// TODO: Cache.
		const origin = item.model.GetDescendants().filter((descendant) => CollectionService.HasTag(descendant, Tag.Dropper))[0] as Part;
		const part = new Instance("Part");
		part.Size = new Vector3(0.5, 0.5, 0.5);
		part.Parent = game.Workspace;
		part.Position = origin.Position.add(new Vector3(0, origin.Size.Y / 2, 0));
		return new Ore(part, item, {
			[Currency.FREE]: 1,
			[Currency.PAID]: 0,
		});
	}
});

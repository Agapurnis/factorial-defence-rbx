import type { Upgrader } from "ReplicatedStorage/Data/Registers/Items/Traits/Upgrader";
import type { Furnace } from "ReplicatedStorage/Data/Registers/Items/Traits/Furnace";
import type { Dropper } from "ReplicatedStorage/Data/Registers/Items/Traits/Dropper";
import { CollectionService, PhysicsService, TweenService } from "@rbxts/services";
import { CollisionGroup } from "ReplicatedStorage/Data/Enums/CollisionGroup";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";
import type { Item } from "./Item";
import { Tag } from "ReplicatedStorage/Data/Enums/Tag";
import Remotes from "ReplicatedStorage/Networking/Remotes";

const billboardTemplate = new Instance("BillboardGui");
const frame = new Instance("Frame");
const text = new Instance("TextLabel");
text.BackgroundTransparency = 1;
text.TextScaled = true;
text.TextStrokeTransparency = 0.5;
text.TextStrokeColor3 = Color3.fromRGB(255, 255, 255);
text.Size = new UDim2(1, 0, 1, 0);
text.Parent = frame;
frame.BackgroundTransparency = 1;
frame.Parent = billboardTemplate;
frame.Size = new UDim2(1, 0, 1, 0);
billboardTemplate.Size = new UDim2(3, 0, 1, 0);
billboardTemplate.StudsOffset = new Vector3(0, 2, 0);

/**
 * A record of what item upgraded an ore, and the UTC timestamp at which it occured.
 */
type StampedUpgrade = [Item<Upgrader>, number];

/**
 * The `Ore` class represents exactly what you think.
 *
 * It keeps track of what it has been upgraded by, as well as its value and it's source dropper.
 *
 * Note that a dropper or upgrader may be placed into the inventory and hence may not seem to exist from an ore,
 * but the ore will ensure a the reference to an item is held, even if the model no longer exists.
 *
 * Note that this means if an ore is never cleaned, it will hold this reference forever, increasing memory usage.
 * To prevent this from occuring, the following is done:
 *  - Ores will check to see if they have moved at all since the last check, and if not, they will be cleaned.
 *  - There will be a set ore limit.
 *  - There will be a button to clear a user's ores.
 */
export class Ore {
	constructor (
		public readonly part: Part,
		public readonly from: Item<Dropper>,
		public worth: Record<Currency, number> = {
			[Currency.PAID]: 0,
			[Currency.FREE]: 0,
		}
	) {
		CollectionService.AddTag(this.part, Tag.Ore);
		this.addText();
		this.updateText();
		this.part.CollisionGroupId = PhysicsService.GetCollisionGroupId("Ore");
		this.part.Touched.Connect((part) => {
			if (part.Name === "Baseplate") {
				this.fade();
				this.disabled = true;
			} else if (CollectionService.HasTag(part, Tag.Furnace)) {
				const user = from.user;
				const item = user.inventory.items[part.Parent!.GetAttribute("InstanceID") as string] as unknown as Item<Furnace>;
				if (!item.enabled || this.disabled) return;
				item.register.sell(this, item, user);
				Remotes.Server.Currency.InformUpdate.Send(user.player, user.money[Currency.FREE]);
				this.fade();
				this.disabled = true;
			} else if (CollectionService.HasTag(part, Tag.Upgrader)) {
				const user = from.user;
				const item = user.inventory.items[part.Parent!.GetAttribute("InstanceID") as string] as unknown as Item<Upgrader>;
				if (!item.enabled) return;
				const stamp = [item, game.Workspace.GetServerTimeNow()] as StampedUpgrade;
				this.upgrades.list.push(stamp);
				const registerStamps = this.upgrades.map.get(item.instanceID) ?? [];
				const instanceStamps = this.upgrades.map.get(item.registerID) ?? [];
				item.register.upgrade(this, item);
				registerStamps.push(stamp);
				instanceStamps.push(stamp);
				this.upgrades.reg.set(item.registerID, registerStamps);
				this.upgrades.map.set(item.instanceID, instanceStamps);
			}
		});
	}

	public updateText () {
		this.part
			.FindFirstChildOfClass("BillboardGui")!
			.FindFirstChildOfClass("Frame")!
			.FindFirstChildOfClass("TextLabel")!
			.Text = `${this.worth[Currency.FREE]}`;
	}

	public upgrades: {
		list: StampedUpgrade[],
		/** registers */ reg: Map<string, StampedUpgrade[]>
		/** instances */ map: Map<string, StampedUpgrade[]>
	} = {
		list: [],
		reg: new Map(),
		map: new Map(),
	};

	public disabled = false;

	private fade () {
		if (this.disabled === true) return; // don't overlap tweens

		const info = new TweenInfo(0.85, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
		const tween = TweenService.Create(this.part, info, { Transparency: 1 });

		this.part.CollisionGroupId = PhysicsService.GetCollisionGroupId(CollisionGroup.NoOreCollide);

		tween.Play();
		tween.Completed.Connect(() => {
			task.delay(0, () => {
				CollectionService.RemoveTag(this.part, Tag.Ore);
				this.part.Destroy();
			});
			tween.Destroy();
		});
	}

	private addText () {
		billboardTemplate.Clone().Parent = this.part;
	}
}


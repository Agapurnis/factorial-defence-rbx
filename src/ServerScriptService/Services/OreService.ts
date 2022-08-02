import type { Logger } from "@rbxts/log";
import type { LoggerService } from "./LoggerService";
import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { OreComponent } from "ReplicatedStorage/Components/Ore";
import type { Components } from "@flamework/components";
import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";
import { CollectionService, PhysicsService, TweenService, Workspace } from "@rbxts/services";
import { CollisionGroup } from "ReplicatedStorage/Enums/CollisionGroup";
import { CollectionTag } from "ReplicatedStorage/Enums/CollectionTag";
import { Currency } from "ReplicatedStorage/Enums/Currency";
import { Service } from "@flamework/core";
import { Option } from "@rbxts/rust-classes";
import { Timer } from "@rbxts/timer";

const ORE_FOLDER = new Instance("Folder");
ORE_FOLDER.Name = "Ore";
ORE_FOLDER.Parent = Workspace;

@Service()
export class OreService {
	/**
	 * The folder all ores are stored in.
	 */
	public static readonly ORE_FOLDER = ORE_FOLDER;
	/**
	 * The amount of milliseconds between each position check and ore cull.
	 */
	public static readonly ORE_POSITION_CULL_INTERVAL = 2_500;

	/**
 	 * Logger for debugging and analytics.
	 */
	private readonly Logger: Logger;

	/**
	 * The amount of currently active ores.
	 */
	private OreCount = 0;
	/**
	 * The timer used to cull ores.
	 */
	private OrePositionCullTimer?: Timer;
	/**
	 * The position an ore was at when it's position was last checked.
	 *
	 * This is used to purge ores that have not moved in some time.
	 */
	private readonly OrePositionCullRecord = new WeakMap<OreComponent, Vector3>();

	/**
	 * Creates an ore with the provided part, source dropper, and price, returing it's component.
	 */
	public async CreateOre (template: Part, dropper: ItemComponent<ItemTrait<ItemTraitEnum.DROPPER>>, value: Partial<Record<Currency, number>>,): Promise<OreComponent> {
		return new Promise((resolve) => {
			const part = template.Clone();
			const origin = dropper.instance.GetDescendants().filter((descendant) => CollectionService.HasTag(descendant, CollectionTag.DROPPER))[0] as Part;
			part.Position = origin.Position.add(new Vector3(0, origin.Size.Y / 2, 0));
			part.Parent = OreService.ORE_FOLDER;

			// Tag so flamework can create a component.
			CollectionService.AddTag(part, CollectionTag.ORE);

			// Defer until flamework creates the component, then resolve with the component.
			task.defer(() => {
				const component = this.Components.getComponent<OreComponent>(part)!;

				// Set the currency values for the ore based on the provided parameters.
				for (const [currency] of pairs(Currency)) {
					if (value[currency] !== undefined) {
						component.attributes[`Value_${currency}`] = value[currency]!;
					}
				}

				// The ore should fade upon touching the baseplate or a descendant of 'Terrain'.
				// In the future, the baseplate behavior will be used for the plots of users.
				component.instance.Touched.Connect((touching) => {
					if (touching === Workspace.FindFirstChild("Baseplate") || touching.IsDescendantOf(Workspace.Terrain)) {
						this.FadeOre(component);
					}
				});

				resolve(component);
			});
		});
	}

	constructor (
		private readonly LoggerService: LoggerService,
		private readonly Components: Components,
	) {
		this.Logger = this.LoggerService.GetLogger<this>();

		// Ensure the ore functions properly when created.
		CollectionService.GetInstanceAddedSignal(CollectionTag.ORE).Connect((instance) => {
			this.OreCount += 1;

			task.defer(() => {
				// We defer to allow Flamework to have enough to time initialize the component.
				const component = this.Components.getComponent<OreComponent>(instance)!;

				// Record this ore's initial position.
				this.OrePositionCullRecord.set(component, component.instance.Position);

				// Make sure the record is deleted when the ore is destroyed.
				// This might not be necessary due to the usage of `WeakMap`, but it's best to be sure.
				component.maid.GiveTask(() => this.OrePositionCullRecord.delete(component));

				// Make sure we decrement the ore count when the instance is destroyed.
				component.maid.GiveTask(() => this.OreCount -= 1);

				// Make sure the ore collides and reacts with the correct things.
				component.instance.CollisionGroupId = PhysicsService.GetCollisionGroupId(CollisionGroup.Ore);
			});
		});

		task.defer(() => {
			// Periodically cull ores that have not moved.
			this.CullOresOnInterval();
		});
	}

	/**
	 * Disables and slowly fades out the ore.
	 */
	public FadeOre (ore: OreComponent) {
		if (ore.Enabled === false) return; // don't overlap tweens

		ore.Enabled = false;

		const info = new TweenInfo(0.85, Enum.EasingStyle.Quad, Enum.EasingDirection.Out);
		const tween = TweenService.Create(ore.instance, info, { Transparency: 1 });

		ore.instance.CollisionGroupId = PhysicsService.GetCollisionGroupId(CollisionGroup.NoOreCollide);

		const connection = tween.Completed.Connect(() => {
			connection.Disconnect();
			tween.Destroy();
			ore.instance.Destroy();
			ore.destroy();
		});

		tween.Play();
	}


	public GetOreFromPart (part: BasePart): Option<OreComponent> {
		return Option.wrap(this.Components.getComponent<OreComponent>(part));
	}

	/**
	 * Culls the ores the haven't moved in a set interval, and then sets a timer to check again later.
	 */
	private CullOresOnInterval (): void {
		// Remove the old timer instance (if it exists) and create a new one, cleaning up the connections.
		this.OrePositionCullTimer?.destroy();
		this.OrePositionCullTimer = new Timer(OreService.ORE_POSITION_CULL_INTERVAL / 1000);

		let CulledCount = 0;

		// Fade all ores that have't moved a slight amount.
		this.OrePositionCullRecord.forEach((position, ore) => {
			if (ore.instance.Position.sub(position).Magnitude < 0.05) {
				CulledCount += 1;
				// Create a new thread to spawn the ore with a slight time offset to give the appearance of randomness.
				// This is for visual effects only. If this ends up being too thread-intensive, we can remove it.
				// There's probably a way to do this without threads as well, but that's for later.
				task.spawn(() => {
					// Introduce a random slight time offset to make things look more genuine.
					task.wait(math.random(0, OreService.ORE_POSITION_CULL_INTERVAL / 2) / 1000);
					// Then fade and disable the ore.
					this.FadeOre(ore);
				});
			}
		});

		// Log all the ores we culled, if it's notable.
		if (this.OreCount !== 0 && CulledCount !== 0) {
			// We're actually logging a bit ahead of time here, since the count is only decremented after the ore is fully culled,
			// which at the time of writing happens after a small random delay to make things look a bit fancier.
			this.Logger.Info(`Culling ${CulledCount} ores. There are now ${this.OreCount - CulledCount} active ores.`);
		}

		// Update the position of each ore.
		this.RecordOrePositions();

		// Restart the timer.
		this.OrePositionCullTimer.completed.Connect(() => this.CullOresOnInterval());
		this.OrePositionCullTimer.start();
	}

	/**
	 * Records the position of every ore.
	 */
	private RecordOrePositions (): void {
		this.Components.getAllComponents<OreComponent>().forEach((component) => {
			this.OrePositionCullRecord.set(component, component.instance.Position);
		});
	}
}

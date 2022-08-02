import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { ItemSelectionController } from "./ItemSelectionController";
import type { ItemSelectionEffectController} from "./ItemSelectionEffectController";
import { TweenService, RunService, ContextActionService } from "@rbxts/services";
import { getAdjustedMouseTargetCFrame } from "StarterPlayer/StarterPlayerScripts/Utility/GetAdjustedMouseTargetCFrame";
import { Controller, Dependency } from "@flamework/core";
import { SelectionBoxStyle } from "./ItemSelectionEffectController";
import Maid from "@rbxts/maid";

const enum RotationDirection {
	CC = "Counter-clockwise",
	CW = "Clockwise"
}

@Controller()
export class ItemMovementController {
	/**
	 * The identifier used for the `ContextActionService` action of **CLOCKWISE** rotation.
	 */
	private static readonly ROTATION_ACTION_CW_NAME = "ItemRotate-CW";
	/**
	 * The identifier used for the `ContextActionService` action of **COUNTER-CLOCKWISE** rotation.
	 */
	private static readonly ROTATION_ACTION_CC_NAME = "ItemRotate-CC";
	/**
	 * The controller used for selecting and deselecting items.
	 */
	private readonly ItemSelectionController = Dependency<ItemSelectionController>();
	/**
	 * The controller used for toggling the selection effect on items.
	 */
	private readonly ItemSelectionEffectController = Dependency<ItemSelectionEffectController>();

	/**
	 * A proxy for the CFrame of the origin point for the items being moved.
	 *
	 * The reason for this being a `CFrameValue` instance is so that we can adaquetely tween every item.
	 */
	private readonly Proxy = new Instance("CFrameValue");
	/**
	 * The connection to the proxy to be cleared upon an origin update.
	 */
	private ProxyConnection?: RBXScriptConnection;
	/**
	 * The primary tween, tweening the CFrame proxy.
	 */
	private Tween?: Tween;
	/**
	 * The origin that the tween is moving the proxy to.
	 */
	private Target = new CFrame();
	/**
	 * The rotation, in degees.
	 */
	private Rotation = 0;
	/**
	 * The origin to be translated.
	 */
	private OriginPivot!: CFrame;
	/**
	 * The offset distances for various components from the origin.
	 */
	private readonly OriginOffsets = new WeakMap<ItemComponent, Vector3>();

	/**
	 * Prepares the movement mode for activation.
	 *
	 * @remarks
	 *  - Sets up the origin and the item offsets in preparation of item translation.
	 *  - Sets the rotation so there isn't a jitter when switching between two items with different rotations.
	 *  - Connects to the proxy CFrame to tween the selected item container model.
	 */
	public Setup () {
		// Clear all offsets, setup the origin pivot and normalize the proxy to said origin pivot.
		this.OriginOffsets.clear();
		this.OriginPivot = this.ItemSelectionController.SelectedItemsContainerModel.GetPivot();
		this.Proxy.Value = this.OriginPivot;

		// Synchronize the rotation.
		this.Rotation = math.deg(this.OriginPivot.Rotation.ToEulerAnglesYXZ()[1]);

		// Setup the initial offsets from the origin pivot for each item.
		this.ItemSelectionController.GetSelected().forEach((item) => {
			this.OriginOffsets.set(item, item.instance.GetPivot().Position.sub(this.OriginPivot.Position));
		});

		// Whenever the proxy is updated, map the proxy's value with an item's offset and update the respective item's pivot position.
		this.ProxyConnection?.Disconnect();
		this.ProxyConnection = this.Proxy.Changed.Connect((value) => {
			this.ItemSelectionController.SelectedItemsContainerModel.PivotTo(value);
		});
	}

	/**
	 * Manually moves the provided item to the position it is supposed to be in.
	 * This should be done after the item has been unparented from the transformer item container model, as if they leave in the middle they may be left in an unexpected position.
	 */
	public ManuallyMoveItem (item: ItemComponent) {
		const BackupMaid = new Maid();
		const BackupProxy = new Instance("CFrameValue");
		const BackupTween = TweenService.Create(BackupProxy, new TweenInfo(0.1), { Value: this.Target.add(this.OriginOffsets.get(item) ?? new Vector3(0)) });
		BackupProxy.Value = item.instance.GetPivot();
		BackupMaid.GiveTask(BackupTween);
		BackupMaid.GiveTask(BackupProxy);
		BackupMaid.GiveTask(BackupProxy.Changed.Connect((value) => item.instance.PivotTo(value)));
		BackupMaid.GiveTask(BackupTween.Completed.Connect(() => BackupMaid.DoCleaning()));
		BackupTween.Play();
	}

	/**
	 * Sets the rotation toggle.
	 */
	public SetRotationToggle (enable: boolean): void {
		// Unbind regardless of whether we are enabling or disabling, since we don't want to have multiple binding for the same event.
		// So if we disable, there won't be any actions, but if we enable, we destroy the existing ones to add new ones.
		ContextActionService.UnbindAction(ItemMovementController.ROTATION_ACTION_CC_NAME);
		ContextActionService.UnbindAction(ItemMovementController.ROTATION_ACTION_CW_NAME);
		// If we are enabling, add the bindings.
		if (enable) {
			ContextActionService.BindAction(ItemMovementController.ROTATION_ACTION_CW_NAME, (_, state) => { if (state === Enum.UserInputState.Begin) this.AdjustRotation(RotationDirection.CW); }, true, ...[Enum.KeyCode.Q]);
			ContextActionService.BindAction(ItemMovementController.ROTATION_ACTION_CC_NAME, (_, state) => { if (state === Enum.UserInputState.Begin) this.AdjustRotation(RotationDirection.CC); }, true, ...[Enum.KeyCode.E]);
		}
	}

	public AdjustRotation (direction: RotationDirection) {
		this.Rotation += (direction === RotationDirection.CW ? 1 : -1) * 90;
		this.Rotation %= 360;
	}

	/**
	 * The connection to the event that moves stuff or whatever.
	 */
	private MovementHookConnection: RBXScriptConnection | undefined;

	/**
	 * Activates the movement mode, enabling rotation mode as well.
	 */
	public ActivateMovementMode (): void {
		this.SetRotationToggle(true);

		const PushOff = this.ItemSelectionController.SelectedItemsContainerModel.PrimaryPart?.Size?.div(2) ?? new Vector3(0);

		// Before we have another connection, disgard the old one if it exists.
		this.MovementHookConnection?.Disconnect();
		this.MovementHookConnection = RunService.Heartbeat.Connect(() => {
			const Adjusted = getAdjustedMouseTargetCFrame(1, this.ItemSelectionController.GetSelected().map((component) => component.instance));

			if (Adjusted.isOk()) {
				const [Point, _, Normal] = Adjusted.unwrap();
				const Value = Point.add(PushOff.mul(Normal)).mul(CFrame.fromEulerAnglesYXZ(0, math.rad(this.Rotation), 0));

				this.Target = Value;
				this.Tween?.Destroy();
				this.Tween = TweenService.Create(this.Proxy, new TweenInfo(0.1, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out), { Value });
				this.Tween.Play();

				// Update every item's selection box based on it's collision status.
				this.ItemSelectionController.GetSelected().forEach((item) => {
					item.IsColliding()
						? this.ItemSelectionEffectController.SetSelectionBox(item, SelectionBoxStyle.ERROR)
						: this.ItemSelectionEffectController.SetSelectionBox(item, SelectionBoxStyle.NORMAL);
				});
			}
		});
	}

	/**
	 * Deactivates the selection mode.
	 */
	public DeactivateMovementMode (): void {
		this.MovementHookConnection?.Disconnect();
		this.SetRotationToggle(false);
	}
}


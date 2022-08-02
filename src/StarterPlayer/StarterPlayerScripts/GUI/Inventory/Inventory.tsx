import type { ItemComponent } from "ReplicatedStorage/Components/Item";
import type { Components } from "@flamework/components";
import type { State } from "@rbxts/basicstate";
import Maid from "@rbxts/maid";
import Roact, { Component } from "@rbxts/roact";
import { Lighting, RunService, TweenService, UserInputService } from "@rbxts/services";
import { ItemRegisterList } from "ReplicatedStorage/Items/ItemRegistry";
import { InventoryItemPopoutPreview } from "./RoactComponents/InventoryItemPopoutPreview";
import { InventoryItemIcon } from "./RoactComponents/InventoryItemIcon";
import { InventoryState } from "./InventoryState";
import { Dependency } from "@flamework/core";
import { Remotes } from "ReplicatedStorage/Networking";

type InventoryProps = {};
type InventoryState = typeof InventoryState extends State<infer U> ? U : never;

const TOPBAR_HEIGHT = 50;

const SCREEN_SIZE = new UDim2(0.75, 0, 0.8, 0);
const SCREEN_POSITION = new UDim2(0.25 / 2, 0, 0.1, 0);
const SCREEN_POSITION_OFFSCREEN = SCREEN_POSITION.add(new UDim2(0, 0, 2, 0));

// #region SFX
const SFX_FOLDER_NAME = "Active SFX";
const SFX_FOLDER_PARENT = script.Parent as ModuleScript;

const SFX_Folder = SFX_FOLDER_PARENT.FindFirstChild(SFX_FOLDER_NAME) ?? new Instance("Folder");
SFX_Folder.Name = SFX_FOLDER_NAME;
SFX_Folder.Parent = SFX_FOLDER_PARENT;

function PlaySFX (id: string, speed = 1, name?: string) {
	if (!RunService.IsRunning()) return; // It won't play if we're editing, and would just cause issues.
	let Sound: Sound | undefined = new Instance("Sound", SFX_Folder);
	Sound.SoundId = id;
	Sound.PlaybackSpeed = speed;
	if (!Sound.IsLoaded) { Sound.Loaded.Wait(); }
	if (name !== undefined) { Sound.Name = name; }
	Sound.Play();
	Sound.Ended.Connect(() => {
		Sound!.Destroy();
		Sound = undefined;
	});
}
// #endregion SFX

/**
 * Chat GUI API - **NOT ACCESSIBLE IN STUDIO EDIT MODE**
 */
const ChatAPI = !RunService.IsRunning() ? undefined : require(game.GetService("Players").LocalPlayer.WaitForChild("PlayerScripts")!.WaitForChild("ChatScript")!.WaitForChild("ChatMain")! as ModuleScript) as {
	// ...
	ToggleVisiblity (): void;
	SetVisible (visible: boolean): void;
	Visible: boolean;
	// ...
};

class Inventory extends Component<
	InventoryProps,
	InventoryState
> {
	private readonly maid = new Maid();
	private readonly blur = Lighting.FindFirstChildOfClass("BlurEffect")!;
	private readonly ref = Roact.createRef<ScreenGui>();

	constructor (props: InventoryProps) {
		super(props);

		this.maid.GiveTask(UserInputService.InputEnded.Connect((input) => {
			if (input.KeyCode === InventoryState.Get("ToggleButton")) {
				InventoryState.Set("Active", !InventoryState.Get("Active"));
			}
		}));
	}

	protected willUnmount(): void {
		this.maid.DoCleaning();
	}

	protected didMount (): void {
		const screen = this.ref.getValue(); if (!screen) return warn("No inventory screen to tween transition for was found, aborting attempt.");
		const frame = screen.WaitForChild("InventoryWrapper") as Frame; if (!frame) return warn("No frame to tween transition for was found, aborting attempt.");

		this.maid.GiveTask(InventoryState.GetChangedSignal("Active").Connect((state) => {
			if (state === true) {
				PlaySFX(InventoryState.Get("ToggleOpenSound"), InventoryState.Get("ToggleOpenSpeed"), "SwooshOpenSFX");
				if (RunService.IsRunning()) ChatAPI!.SetVisible(false); // Hide chat for smoother transition.
				// #region GUI Tween
				const tweenGui = TweenService.Create(frame, new TweenInfo(0.35), { Position:SCREEN_POSITION });
				tweenGui.Play();
				tweenGui.Completed.Connect(() => {
					tweenGui.Destroy();
				});
				// #endregion GUI Tween
				// #region Blur Tween
				const tweenBlur = TweenService.Create(this.blur, new TweenInfo(0.35), { Size: 10 });
				tweenBlur.Play();
				tweenBlur.Completed.Connect(() => {
					tweenBlur.Destroy();
				});
				// #endregion Blur Tween
			} else {
				PlaySFX(InventoryState.Get("ToggleCloseSound"), InventoryState.Get("ToggleCloseSpeed"), "SwooshCloseSFX");
				// #region GUI Tween
				const tweenGui = TweenService.Create(frame, new TweenInfo(1), { Position: SCREEN_POSITION_OFFSCREEN });
				tweenGui.Play();
				tweenGui.Completed.Connect(() => {
					tweenGui.Destroy();
				});
				// #endregion GUI Tween
				// #region Blur Tween
				const tweenBlur = TweenService.Create(this.blur, new TweenInfo(0.4), { Size: 0 });
				tweenBlur.Play();
				tweenBlur.Completed.Connect(() => {
					tweenBlur.Destroy();
				});
				// #endregion Blur Tween
			}
		}));
	}

	public render () {
		return <screengui Key="InventoryGUI" Ref={this.ref}>
			<InventoryItemPopoutPreview />
			<frame Key="InventoryWrapper"
				Position={SCREEN_POSITION_OFFSCREEN}
				Size={SCREEN_SIZE}
			>
				<uilistlayout Key="InventoryWrapperLayout" SortOrder={Enum.SortOrder.LayoutOrder} />
				<frame LayoutOrder={0} Size={new UDim2(1, 0, 0, TOPBAR_HEIGHT)} Key="InventoryTopbar">
					<uilistlayout Key="InventoryTopbarList" FillDirection={Enum.FillDirection.Horizontal} />
					<textlabel Key="TopbarButtonInventory" Text="Inventory" Size={new UDim2(0, 100, 0, TOPBAR_HEIGHT)} />
					<textlabel Key="TopbarButtonStore"     Text="Store"     Size={new UDim2(0, 100, 0, TOPBAR_HEIGHT)} />
				</frame>
				<scrollingframe
					Key="InventoryContentResults"
					Size={new UDim2(1, 0, 1, -TOPBAR_HEIGHT)}
					AutomaticCanvasSize={Enum.AutomaticSize.Y}
					CanvasSize={new UDim2(0, 0, 0, 0)}
					BorderSizePixel={0}
					VerticalScrollBarInset={Enum.ScrollBarInset.Always}
					VerticalScrollBarPosition={Enum.VerticalScrollBarPosition.Left}
					LayoutOrder={1}
				>
					<uigridlayout Key="InventoryGrid" />
					<uipadding Key="InventoryPadding"
						PaddingLeft={new UDim(0, 10)}
						PaddingTop={new UDim(0, 25)}
					/>
					{ItemRegisterList.map((register) => (
						<InventoryItemIcon register={register}
							Events={{
								"MouseEnter": () => InventoryState.Set("Hovering", register),
								"MouseLeave": () => InventoryState.Set("Hovering", "NONE"),
								"MouseMoved": () => {
									// If we skipped over an entrance event, catch back up by setting the item.
									// It seems like it isn't possible to skip over an exit event, thankfully.
									if (InventoryState.Get("Hovering") !== register) InventoryState.Set("Hovering", register);
								},
								"MouseButton1Down": () => {
									const uuid = Remotes.Client.Item.CreateItem.Call([register.id]).expect("error spawning item");
									const item = Dependency<Components>().getComponent<ItemComponent>(game.Workspace.WaitForChild(uuid));
								}
							}}
						/>
					))}
				</scrollingframe>
			</frame>
		</screengui>;
	}
}

const Stated = InventoryState.Roact(Inventory);

export { Stated as Inventory };

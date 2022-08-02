import type { State } from "@rbxts/basicstate";
import Maid from "@rbxts/maid";
import Roact, { Component } from "@rbxts/roact";
import { InventoryState } from "../InventoryState";
import { Players } from "@rbxts/services";

type InventoryItemPopoutPreviewProps = {};
type InventoryItemPopoutPreviewState = typeof InventoryState extends State<infer U> ? U : never;

// TODO: See how this works on an actual mobile device.
/**
 * The popout preview that appears when hovering over an item in the shop/inventory.
 * It shows the item's name and it's price.
 *
 * Note that the preview may appear slightly laggy in the HoarceKat storybook.
 * In actual gameplay, no delay is noticable.
 */
class InventoryItemPopoutPreview extends Component<
	InventoryItemPopoutPreviewProps,
	InventoryItemPopoutPreviewState
> {
	public static readonly OFFSET = new UDim2(0, 10, 0, 10);

	private readonly maid = new Maid();
	private readonly mouse = Players.LocalPlayer.GetMouse();
	private readonly position = Roact.createBinding(new UDim2(0, this.mouse.X, 0, this.mouse.Y));
	private mouseConnection?: RBXScriptConnection;

	/**
	 * Attaches a mouse watcher to update the position property.
	 */
	public watchMouse (): void {
		// If we're already watching, don't set any new connections.
		if (this.mouseConnection !== undefined) return;
		// Otherwise, create a new connection and set it so we can disconnect later.
		this.mouseConnection = this.mouse.Move.Connect(() => {
			this.position[1](new UDim2(0, this.mouse.X, 0, this.mouse.Y).add(InventoryItemPopoutPreview.OFFSET));
		});
	}

	protected willUnmount (): void {
		this.maid.GiveTask(this.mouseConnection ?? { Destroy () {} });
		this.maid.DoCleaning();
	}

	public constructor (props: InventoryItemPopoutPreviewProps) {
		super(props);

		this.maid.GiveTask(InventoryState.GetChangedSignal("Active").Connect((active) => {
			if (active) {
				this.watchMouse();
			} else {
				this.mouseConnection?.Disconnect();
				this.mouseConnection = undefined;
			}
		}));
	}

	public render (): Roact.Element {
		// If no item is selected, return an empty element to render nothing.
		if (this.state.Hovering === "NONE") return <></>;
		// There isn't any reason to render this when disabled either, it just consumes cycles watching the mouse.
		if (!this.state.Active) return <></>;

		return <frame
			Key={"InventoryItemPopoutPreviewFrame"}
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
		>
			<textlabel Key={"InventoryItemPopoutPreviewLabel"}
				AutomaticSize={Enum.AutomaticSize.XY}
				Position={this.position[0]}
				ZIndex={5}
				TextSize={12}
				Text={this.state.Hovering.name}
			>
				<uipadding
					Key={"InventoryItemPopoutPreviewLabelPadding"}
					PaddingTop={new UDim(0, 3)}
					PaddingLeft={new UDim(0, 3)}
					PaddingRight={new UDim(0, 3)}
					PaddingBottom={new UDim(0, 3)}
				/>
			</textlabel>
		</frame>;
	}
}

const Stated = InventoryState.Roact(InventoryItemPopoutPreview);

export { Stated as InventoryItemPopoutPreview };

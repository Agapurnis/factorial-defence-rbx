import Roact from "@rbxts/roact";
import type { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import type { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { GraphicsSelected } from "../GraphicsSelected";
import { GraphicsState } from "../GraphicsState";
import { GuiService, Players, TextService } from "@rbxts/services";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";

export const enum ItemPopoutDisplayMode {
	INVENTORY = "INVENTORY",
	SHOP = "SHOP",
}

interface ItemPopoutProps {}
interface ItemPopoutState {
	item: "NONE" | ItemRegister<ItemTraitEnum[], ItemTrait>
	mode: "NONE" | GraphicsSelected
}

export class ItemPopoutGUI extends Roact.Component<
	ItemPopoutProps,
	ItemPopoutState
> {
	public position: LuaTuple<[Roact.Binding<Vector2>, (newValue: Vector2) => void]>;
	public reference = Roact.createRef<Frame>();

	constructor (props: ItemPopoutProps) {
		super(props);

		const mouse = Players.LocalPlayer.GetMouse();
		this.position = Roact.createBinding(new Vector2(mouse.X, mouse.Y));
		this.setState({
			item: "NONE",
			mode: "NONE",
		});

		GraphicsState.input.Bind(["MouseMovement"], () => {
			this.position[1](new Vector2(mouse.X, mouse.Y));
			this.setState({
				item: GraphicsState.item,
				mode: GraphicsState.over,
			});
		});
	}

	render () {
		if (
			this.state.item === "NONE" ||
			this.state.mode === "NONE"
		) return (<></>);

		return (
			<frame
				Ref={this.reference}
				AutomaticSize={"XY"}
				BackgroundColor3={new Color3(0, 0, 0)}
				BackgroundTransparency={0.5}
				Position={this.position[0].map((position) => {
					// Adjust position so that it doesn't go off-screen.
					const camera = game.Workspace.CurrentCamera;
					const frame = this.reference.getValue();
					if (frame === undefined || camera === undefined) return new UDim2(
						// Don't display it.
						0, math.huge,
						0, math.huge,
					);

					const bounds = camera.ViewportSize;
					const inset = GuiService.GetGuiInset()[0];
					const size = frame.AbsoluteSize;

					return new UDim2(
						0, bounds.X > position.X + size.X + inset.X ? position.X : bounds.X - size.X - inset.X,
						0, bounds.Y > position.Y + size.Y + inset.Y ? position.Y : bounds.Y - size.Y - inset.Y,
					);
				})}
			>
				<uipadding
					PaddingTop={new UDim(0, 15)}
					PaddingLeft={new UDim(0, 15)}
					PaddingRight={new UDim(0, 15)}
					PaddingBottom={new UDim(0, 15)}
				/>
				<uisizeconstraint
					MinSize={new Vector2(0, 0)}
					MaxSize={new Vector2(250, 250)}
				/>

				<textlabel
					BackgroundTransparency={1}
					TextStrokeTransparency={0.8}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={11}
					Text={this.state.item.name}
					Size={new UDim2(1, 0, 1, 0)}
					Position={new UDim2(0, 0, 0, 0)}
				/>
				{this.state.mode === GraphicsSelected.SHOP ? <>
					<textlabel
						BackgroundTransparency={1}
						TextStrokeTransparency={0.8}
						TextYAlignment={Enum.TextYAlignment.Top}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={11}
						Text={"Price: " + tostring(this.state.item?.price[ExchangeType.PURCHASE]?.[Currency.FREE] ?? "Cannot purchase")}
						Size={new UDim2(1, 0, 1, 0)}
						Position={new UDim2(0, 0, 0, 20)}
					/>
				</> : <></>}
			</frame>
		);
	}
}

import Roact from "@rbxts/roact";
import type { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import type { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { GraphicsSelected } from "../GraphicsSelected";
import { GraphicsState } from "../GraphicsState";
import { Players } from "@rbxts/services";
import { ExchangeType } from "ReplicatedStorage/Data/Enums/ExchangeType";
import { Currency } from "ReplicatedStorage/Data/Enums/Currency";

export const enum ItemPopoutDisplayMode {
	INVENTORY = "INVENTORY",
	SHOP = "SHOP",
}

interface ItemPopoutProps {}
interface ItemPopoutState {
	position: Vector2,
	item: "NONE" | ItemRegister<ItemTraitEnum[], ItemTrait>
	mode: "NONE" | GraphicsSelected
}

export class ItemPopoutGUI extends Roact.Component<
	ItemPopoutProps,
	ItemPopoutState
> {
	constructor (props: ItemPopoutProps) {
		super(props);

		const mouse = Players.LocalPlayer.GetMouse();

		this.setState({
			position: new Vector2(0, 0),
			item: "NONE",
			mode: "NONE",
		});

		GraphicsState.input.Bind(["MouseMovement"], () => {
			this.setState({
				item: GraphicsState.item,
				mode: GraphicsState.over,
				position: new Vector2(mouse.X, mouse.Y),
			});
		});
	}

	render () {
		if (
			this.state.item === "NONE" ||
			this.state.mode === "NONE"
		) return (<></>);

		const origin = this.state.position;
		// const bl = this;
		return (
			<frame
				BackgroundColor3={new Color3(0, 0, 0)}
				BackgroundTransparency={0.5}
				Position={new UDim2(0, this.state.position.X, 0, this.state.position.Y)}
			>
				<textlabel
					BackgroundColor3={Color3.fromRGB(0, 0, 0)}
					BackgroundTransparency={0.5}
					TextStrokeTransparency={0.8}
					TextYAlignment={Enum.TextYAlignment.Top}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					TextSize={11}
					Text={this.state.item.name}
					Size={new UDim2(1, 0, 1, 0)}
					Position={new UDim2(0, 15, 0, 0)}
				/>
				{this.state.mode === GraphicsSelected.SHOP ? <>
					<textlabel
						BackgroundColor3={Color3.fromRGB(0, 0, 0)}
						BackgroundTransparency={0.5}
						TextStrokeTransparency={0.8}
						TextYAlignment={Enum.TextYAlignment.Top}
						TextXAlignment={Enum.TextXAlignment.Left}
						TextColor3={Color3.fromRGB(255, 255, 255)}
						TextSize={11}
						Text={"Price: " + tostring(this.state.item?.price[ExchangeType.PURCHASE]?.[Currency.FREE] ?? "Cannot purchase")}
						Size={new UDim2(1, 0, 1, 0)}
						Position={new UDim2(0, 15, 0, 20)}
					/>
				</> : <></>}
			</frame>
		);
	}
}

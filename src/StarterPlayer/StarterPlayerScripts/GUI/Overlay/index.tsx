import Roact from "@rbxts/roact";

export const MoneyDisplayBinding = Roact.createBinding(0);
export class OverlayGUI extends Roact.Component {
	public render() {
		return <frame
			Size={new UDim2(1, 0, 1, 0)}
			BackgroundTransparency={1}
		>
			<textlabel
				Text={MoneyDisplayBinding[0].map(v => "$" + tostring(v))}
				TextScaled={true}
				Position={new UDim2(0.2, 0, 0.15, 0)}
				BackgroundTransparency={1}
				TextStrokeTransparency={0}
				TextStrokeColor3={Color3.fromRGB(255, 255, 255)}
				TextXAlignment={Enum.TextXAlignment.Right}
				TextYAlignment={Enum.TextYAlignment.Bottom}
				Size={new UDim2(0.8, 0, 0.85, 0)}
			>
				<uitextsizeconstraint
					MinTextSize={1}
					MaxTextSize={45}
				/>
			</textlabel>
		</frame>;
	}
}

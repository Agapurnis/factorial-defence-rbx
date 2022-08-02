import Roact from "@rbxts/roact";
import type { State } from "@rbxts/basicstate";
import { MetaMenuState } from "../../MetaMenuState";
import { Component } from "@rbxts/roact";

type MetaMenuHomePageProps = {};
type MetaMenuHomePageState = typeof MetaMenuState extends State<infer U> ? U : never;

const PAGE_MIN_SIZE = new Vector2(200, 200);

class MetaMenuHomePage extends Component<
	MetaMenuHomePageProps,
	MetaMenuHomePageState
> {
	constructor (props: MetaMenuHomePageProps) {
		super(props);

		MetaMenuState.Set("PageMinimumSize", PAGE_MIN_SIZE);
	}

	render () {
		return (<frame Size={new UDim2(1, 0, 1, 0)} BackgroundTransparency={1}>
			<uisizeconstraint MinSize={PAGE_MIN_SIZE} />
			<uipadding PaddingLeft={new UDim(0, 10)} PaddingRight={new UDim(0, 10)} />

			<textlabel
				BackgroundTransparency={1}
				Size={new UDim2(1, 0, 1, 0)}
				TextStrokeColor3={this.state.Theme.Text.SubStroke}
				TextStrokeTransparency={0}
				TextScaled={true}
				TextColor3={this.state.Theme.Text.Sub}
				Text="ExampleText"
			>
				<uitextsizeconstraint
					MinTextSize={5}
					MaxTextSize={35}
				/>
				<textlabel
					BackgroundTransparency={1}
					Size={new UDim2(1, 0, 1, 0)}
					Position={new UDim2(0, 0, 0, 50)}
					TextStrokeColor3={this.state.Theme.Text.SubStroke}
					TextStrokeTransparency={0}
					TextScaled={true}
					TextColor3={this.state.Theme.Text.Sub}
					Text="Subtitle"
				>
					<uitextsizeconstraint
						MinTextSize={5}
						MaxTextSize={35}
					/>
				</textlabel>
			</textlabel>
		</frame>);
	}
}
export default MetaMenuState.Roact(MetaMenuHomePage);

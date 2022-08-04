import type { State } from "@rbxts/basicstate";
import Roact from "@rbxts/roact";
import { Component } from "@rbxts/roact";
import { MetaMenuState } from "../../MetaMenuState";

type MetaMenuHomeDataProps = {};
type MetaMenuHomeDataState = typeof MetaMenuState extends State<infer U> ? U : never;

const PAGE_MIN_SIZE = new Vector2(200, 200);

class MetaMenuDataPage extends Component<
	MetaMenuHomeDataProps,
	MetaMenuHomeDataState
> {
	constructor (props: MetaMenuHomeDataProps) {
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
				Text="Theme"
			>
			</textlabel>
		</frame>);
	}
}

export default MetaMenuState.Roact(MetaMenuDataPage);

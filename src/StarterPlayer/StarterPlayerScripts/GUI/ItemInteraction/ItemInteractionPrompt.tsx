import type { State } from "@rbxts/basicstate";
import Roact, { Component } from "@rbxts/roact";
import { ItemInteractionPromptState } from "./ItemInteractionPromptState";

type ItemInteractionPromptProps = {};
type ItemInteractionPromptState = typeof ItemInteractionPromptState extends State<infer U> ? U : never;

const ItemInteractionPromptSize = new UDim2(1, 0, 1, 0);

/**
 * NOTE: Movement logic and such doesn't occur here.
 *
 * See `ItemInteractionController.ts` for all that stuff.
 * This is merely visual clues.
 */
class ItemInteractionPrompt extends Component<
	ItemInteractionPromptProps,
	ItemInteractionPromptState
> {
	public render(): Roact.Element {
		return <frame
			Key="ItemInteractionPromptBackgroundFrame"
			Size={ItemInteractionPromptSize}
			BackgroundColor3={Color3.fromRGB(114, 116, 118)}
		>
			<uicorner Key="ItemInteractionPromptBackgroundFrameUICorner" />
			<frame
				Key="ItemInteractionPromptForegroundFrame"
				Size={ItemInteractionPromptSize.sub(new UDim2(0, 5, 0, 5))}
				BackgroundColor3={Color3.fromRGB(126, 127, 129)}
			>
				<uicorner Key="ItemInteractionPromptForegroundFrameUICorner" />
				<uipadding Key="ItemInteractionPromptForegroundFrameUIPadding"
					PaddingTop={new UDim(0, 5)}
					PaddingLeft={new UDim(0, 5)}
					PaddingRight={new UDim(0, 5)}
					PaddingBottom={new UDim(0, 5)}
				/>

				<imagelabel
					BackgroundTransparency={1}
					Size={new UDim2(0.4, 0, 0.4, 0)}
					Image="rbxassetid://10311635544"
					Key="ItemInteractionPromptMoveButtonImageLabel"
					ImageRectSize={new Vector2(100, 100)}
					ImageRectOffset={new Vector2(200, 900)}
				>
					<uiaspectratioconstraint
						AspectRatio={1}
						Key="ItemInteractionPromptMoveButtonImageSizeAspectRatioConstraint"
					/>
				</imagelabel>
				<textlabel
					Text="Move"
					TextScaled={true}
					TextStrokeTransparency={0.8}
					TextXAlignment={Enum.TextXAlignment.Left}
					TextYAlignment={Enum.TextYAlignment.Center}
					TextColor3={Color3.fromRGB(255, 255, 255)}
					Key="ItemInteractionPromptMoveTextLabel"
					BackgroundTransparency={1}
					Position={new UDim2(0.2, 0, 0.075, 0)}
					Size={new UDim2(0.275, 0, 0.25, 0)}
					Font={Enum.Font.Gotham}
				/>
			</frame>
		</frame>;
	}
}

const Stated = ItemInteractionPromptState.Roact(ItemInteractionPrompt);

export { Stated as ItemInteractionPrompt };

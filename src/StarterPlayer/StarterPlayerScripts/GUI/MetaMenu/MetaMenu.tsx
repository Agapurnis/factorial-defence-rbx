import type { State } from "@rbxts/basicstate";
import Roact, { Component } from "@rbxts/roact";
import { Players } from "@rbxts/services";
import { MetaMenuState } from "./MetaMenuState";
import { MetaMenuPage } from "./Enums/Page";
import MetaMenuDataPage from "./RoactComponents/Pages/Data";
import MetaMenuHomePage from "./RoactComponents/Pages/Home";

const DEFAULT_SIZE = UDim2.fromOffset(550, 250);
const DEFAULT_POSITION = new UDim2(0.5, -0.5 * DEFAULT_SIZE.X.Offset, 0.5, -0.5 * DEFAULT_SIZE.Y.Offset);
const CORNER_RADIUS = 4;

const TOPBAR_SIZE = 25;

const RESIZE_SIZE = 20;
const RESIZE_PADDING = 5;
const RESIZE_TEXTURE = "rbxassetid://10263857389";

const EXIT_SIZE = 15;
const EXIT_PADDING = 6;
const EXIT_TEXUTRE = "rbxassetid://575072552";

type MetaMenuProps = {};
type MetaMenuState = typeof MetaMenuState extends State<infer U> ? U : never;

/**
 * The MetaMenu is a GUI that is used to display 'meta' information about the game.
 * This is stuff that probably isn't needed for the average user, and is instead meant for administrative purposes.
 *
 * It is draggable and resizable, and contains underlying pages that can be switched between via a topbar listing tabs.
 *
 * TODO: Refactor based on comments mentioned throughout.
 */
class MetaMenu extends Component<
	MetaMenuProps,
	MetaMenuState
> {
	/**
	 * If the mouse is dragging the window to change it's position.
	 * This ideally should be refactored to be one state property alongisde `mouseHeldSize`.
	 */
	private mouseHeldPosition = false;
	/**
	 * If the mouse is dragging the window to change it's size.
	 * This ideally should be refactored to be one state property alongisde `mouseHeldPosition`.
	 */
	private mouseHeldSize = false;

	/**
	 * A snapshot of where the mouse began some sort of drag, used for relative updates.
	 * This ideally probably isn't actually needed, but it works enough for now.
	 */
	private mouseOrigin = Vector2.zero;

	/**
	 * A snapshot of the previous size of the window, used for relative updates.
	 * This ideally probably isn't actually needed, but it works enough for now.
	 */
	private sizeSnapshot = UDim2.fromScale(0, 0);

	/**
	 * The mouse used to get positions.
	 */
	private readonly mouse = Players.LocalPlayer.GetMouse();

	// Various properties of the window, being in the form [binding, updater].
	/** * The top left point of the window. */
	private readonly position: LuaTuple<[Roact.Binding<UDim2>, (newValue: UDim2) => void]>;
	private readonly size:     LuaTuple<[Roact.Binding<UDim2>, (newValue: UDim2) => void]>;

	/**
	 * Create a thread which will automatically update the cursor icon when needed,
	 * and resize the window when it is being held down.
	 */
	private spawn () {
		task.spawn(() => {
			// This loop will continue infinitely until the window is closed.
			while (task.wait() !== undefined && this.state.Active) {
				if (this.mouseHeldPosition) {
					this.mouse.Icon = "rbxasset://SystemCursors/ClosedHand";
					this.position[1](new UDim2(
						0.5, this.mouse.X + this.mouseOrigin.X,
						0.5, this.mouse.Y + this.mouseOrigin.Y
					));
				} else if (this.mouseHeldSize) {
					this.mouse.Icon = "rbxasset://SystemCursors/ClosedHand";
					const newSize = new Vector2(this.mouse.X, this.mouse.Y).sub(this.mouseOrigin)
						.add(new Vector2(this.sizeSnapshot.X.Offset, this.sizeSnapshot.Y.Offset))
						.Max(new Vector2(TOPBAR_SIZE + RESIZE_SIZE + RESIZE_PADDING , TOPBAR_SIZE + RESIZE_SIZE + RESIZE_PADDING * 2));

					this.size[1](UDim2.fromOffset(newSize.X, newSize.Y));
				}
			}
		});
	}

	constructor (props: MetaMenuProps) {
		super(props);

		// Set the bindings and updaters.
		this.position = Roact.createBinding(DEFAULT_POSITION);
		this.size     = Roact.createBinding(DEFAULT_SIZE);

		// Create an activity connection to create a mouse-updating thread when the menu becomes active.
		// We don't need to do anything regarding 'closing' the thread as it will automately close upon loop termination/completion.
		MetaMenuState.GetChangedSignal("Active").Connect((active) => {
			if (this.state.Active) {
				this.spawn();
			}
		});
	}

	public render () {
		return <screengui Key="MetaMenuGUI">
			<frame
				Key="MetaMenuWindow"
				Visible={this.state.Active}
				BackgroundColor3={this.state.Theme.Background.Main}
				ClipsDescendants={true}
				Position={this.position[0]}
				Size={this.size[0]}
			>
				<frame
					Key="MetaMenuTopbar"
					ZIndex={1}
					Size={new UDim2(1, 0, 0, TOPBAR_SIZE)}
					BackgroundColor3={this.state.Theme.Background.Topbar}
					Event={{
						"InputEnded": (_, event) => { if (event.UserInputType === Enum.UserInputType.MouseButton1) { this.mouseOrigin =     Vector2.zero;                                                                                                                     this.mouseHeldPosition = false;  } },
						"InputBegan": (_, event) => { if (event.UserInputType === Enum.UserInputType.MouseButton1) { this.mouseOrigin = new Vector2(this.position[0].getValue().X.Offset, this.position[0].getValue().Y.Offset).sub(new Vector2(this.mouse.X, this.mouse.Y)); this.mouseHeldPosition = true;   } },
					}}
				>
					<uicorner Key="MetaMenuTopbarCorners" CornerRadius={new UDim(0, CORNER_RADIUS)} />
					<uilistlayout Key="MetaMenuTopbarListLayout" FillDirection={Enum.FillDirection.Horizontal} />
					<frame
						Key="MetaMenuTopbarExitButtonContainer"
						BackgroundTransparency={1}
						Size={new UDim2(0, EXIT_SIZE + EXIT_PADDING * 2, 0, EXIT_SIZE + EXIT_PADDING * 2)}
					>
						<imagebutton
							Key="MetaMenuTopbarExitButton"
							Image={EXIT_TEXUTRE}
							BackgroundTransparency={1}
							Position={new UDim2(0, EXIT_PADDING, 0, EXIT_PADDING)}
							Size={new UDim2(0, EXIT_SIZE, 0, EXIT_SIZE)}
							Event={{
								"MouseButton1Down": () => MetaMenuState.Set("Active", false)
							}}
						/>
					</frame>
					{this.state.Pages.map(([name, identity], index) => (<textbutton
						Key={`MetaMenuTopbarPage${index}`}
						Size={new UDim2(0, 100, 0, TOPBAR_SIZE)}
						Text={name}
						Event={{
							"MouseButton1Down": () => MetaMenuState.Set("Page", identity as MetaMenuPage)
						}}
					/>))}
				</frame>
				<uicorner Key="MetaMenuCorners" CornerRadius={new UDim(0, CORNER_RADIUS)} />
				<frame
					Key={"MetaMenuBottomHolder"}
					BackgroundTransparency={1}
					Position={new UDim2(0, 0, 1, -(RESIZE_SIZE + RESIZE_PADDING * 2))}
					Size={new UDim2(1, 0, 0, RESIZE_SIZE + RESIZE_PADDING * 2)}
				>
					<uicorner Key="MetaMenuResizeHolderCorners" CornerRadius={new UDim(0, CORNER_RADIUS)} />
					<imagelabel
						Key="MetaMenuResizeDragger"
						Image={RESIZE_TEXTURE}
						ImageColor3={this.state.Theme.Interactive.Dragger}
						BackgroundTransparency={1}
						Position={new UDim2(1, -(RESIZE_SIZE + RESIZE_PADDING), 1, -(RESIZE_SIZE + RESIZE_PADDING))}
						Size={new UDim2(0, RESIZE_SIZE, 0, RESIZE_SIZE)}
						Event={{
							"InputEnded": (_, event) => { if (event.UserInputType === Enum.UserInputType.MouseButton1) { this.mouseOrigin =     Vector2.zero;                        this.sizeSnapshot = this.size[0].getValue(); this.mouseHeldSize = false; this.mouse.Icon = "rbxasset://SystemCursors/SizeNWSE"; } },
							"InputBegan": (_, event) => { if (event.UserInputType === Enum.UserInputType.MouseButton1) { this.mouseOrigin = new Vector2(this.mouse.X, this.mouse.Y); this.sizeSnapshot = this.size[0].getValue(); this.mouseHeldSize = true;                                                         } },
							"MouseEnter": (_) => { this.mouse.Icon = "rbxasset://SystemCursors/SizeNWSE"; },
							"MouseLeave": (_) => { this.mouse.Icon = "rbxasset://SystemCursors/Arrow"; },
						}}
					/>
				</frame>
				<scrollingframe
					Key="MetaMenuContent"
					Size={new UDim2(1, 0, 1, -1 * TOPBAR_SIZE - RESIZE_SIZE - RESIZE_PADDING )}
					BorderSizePixel={0}
					Position={new UDim2(0, 0, 0, TOPBAR_SIZE)}
					CanvasSize={new UDim2(0, this.state.PageMinimumSize.X, 0, this.state.PageMinimumSize.Y)}
					BackgroundTransparency={1}
				>
					{(() => {
						if (this.state.Page === MetaMenuPage.HOME) return (<MetaMenuHomePage />);
						if (this.state.Page === MetaMenuPage.DATA) return (<MetaMenuDataPage />);
					})()!}
				</scrollingframe>
			</frame>
		</screengui>;
	}
}

const Stated = MetaMenuState.Roact(MetaMenu);

export { Stated as MetaMenu };

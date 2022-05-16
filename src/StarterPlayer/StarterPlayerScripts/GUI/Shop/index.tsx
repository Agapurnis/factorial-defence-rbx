
import Roact from "@rbxts/roact";
import Remotes from "ReplicatedStorage/Networking/Remotes";
import type { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { ItemPurchaseError } from "ReplicatedStorage/Networking/Definitions/Item/PurchaseItem";
import { ItemRegisterList } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";
import { PlacementStatus } from "StarterPlayer/StarterPlayerScripts/Placement/PlacementStatus";
import { PlacementState } from "StarterPlayer/StarterPlayerScripts/Placement/PlacementState";
import type { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import { GraphicsContext } from "../GraphicsContext";
import { RenderCamera } from "../RenderCamera";
import Log from "@rbxts/log";

const Previews: Record<string, Model> = {};

function buyItem (input: InputObject, register: ItemRegister<ItemTraitEnum[], ItemTrait>): void {
	if (input.UserInputType !== Enum.UserInputType.MouseButton1) return;
	if (PlacementState.Mode === PlacementStatus.Move) return;
	const response = Remotes.Client.Item.PurchaseItem(register.id).await();
	if (!response[0]) { Log.Error("Request failure @buyItem!"); return; }
	if (!response[1].isOk()) {
		const err = response[1].unwrapErr();
		if (err !== ItemPurchaseError.NotEnoughMoney) {
			Log.Warn("Purchase failure @buyItem: " + err);
		}
	}
}

interface ShopGUIProps { opened: boolean }
interface ShopGUIState { opened: boolean }

export class ShopGUI extends Roact.Component<
	ShopGUIProps,
	ShopGUIState
> {
	public constructor (props: ShopGUIProps) {
		super(props);

		this.setState({
			opened: props.opened,
		});

		GraphicsContext.Bind(["F"], () => {
			this.setState({ opened: !this.state.opened });
		});
	}

	public render() {
		return <frame
			Size={new UDim2(0, 350, 1, 0)}
			Style={Enum.FrameStyle.RobloxSquare}
			Position={new UDim2(1, -350, 0, 0)}
			Visible={this.state.opened}
		>
			<textlabel
				Text="Shop"
				TextSize={29}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				Size={new UDim2(1, 0, 0, 65)}
			/>
			<imagebutton
				Size={new UDim2(0, 45, 0, 45)}
				Image={"http://www.roblox.com/asset/?id=2524572083"}
				Position={new UDim2(1, -45, 0, 5)}
				BackgroundTransparency={1}
				Event={{
					"MouseButton1Click": () => {
						this.setState({ opened: false });
					}
				}}
			/>
			<scrollingframe
				BackgroundTransparency={1}
				ScrollBarImageColor3={Color3.fromRGB(120, 116, 117)}
				Position={new UDim2(0, 0, 0.1, 0)}
				Size={new UDim2(1, 0, 0.9, 0)}
			>
				<uigridlayout />
				{ItemRegisterList.map((register) => {
					let active = false;
					let spinthread: thread | undefined;
					const reference = Roact.createRef<ViewportFrame>();

					task.defer(() => {
						while (!reference.getValue()) { task.wait(); }
						if (Previews[register.id]) return;
						const preview = register.model.Clone();
						preview.PivotTo(new CFrame(0, -1 * (preview.GetBoundingBox()[1].Y / 4), 0));
						preview.Parent = reference.getValue();
						Previews[register.id] = preview;
					});

					let i = 0;

					return (
						<viewportframe
							Ref={reference}
							Ambient={Color3.fromRGB(196, 219, 199)}
							LightDirection={new Vector3(1, 1, 1)}
							CurrentCamera={RenderCamera}
							Size={new UDim2(1, 0, 1, 0)}
							Event={{
								"InputBegan": (_, input) => buyItem(input, register),
								"MouseLeave": () => {
									i = 0;
									active = false;
									task.defer(() => {
										if (spinthread) task.cancel(spinthread);
										if (!Previews[register.id]) return;
										const piv = Previews[register.id].GetPivot();
										const pos = new CFrame(piv.Position);
										Previews[register.id].PivotTo(pos);
									});
									spinthread = undefined;
								},
								"MouseEnter": () => {
									active = true;
									if (spinthread) return;
									if (!Previews[register.id]) return;
									spinthread = task.spawn(() => {
										// eslint-disable-next-line no-constant-condition
										while (active) {
											task.wait();
											if (!reference.getValue()) continue; i++;
											const piv = Previews[register.id].GetPivot();
											const pos = new CFrame(piv.Position);
											Previews[register.id].PivotTo(pos.mul(CFrame.fromEulerAnglesYXZ(0, math.rad(i), 0)));
										}
									});
								}
							}}
						/>
					);
				})}
			</scrollingframe>
		</frame>;
	}
}

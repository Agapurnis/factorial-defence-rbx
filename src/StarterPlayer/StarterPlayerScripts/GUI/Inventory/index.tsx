import Roact from "@rbxts/roact";
import Remotes from "ReplicatedStorage/Networking/Remotes";
import type { ItemTrait, ItemTraitEnum } from "ReplicatedStorage/Data/Registers/Items/ItemTrait";
import { Item } from "ReplicatedStorage/Classes/Item";
import { LocalUser } from "StarterPlayer/StarterPlayerScripts/State";
import { moveItem } from "StarterPlayer/StarterPlayerScripts/Placement/Actions/Move";
import { PlacementStatus } from "StarterPlayer/StarterPlayerScripts/Placement/PlacementStatus";
import { PlacementState } from "StarterPlayer/StarterPlayerScripts/Placement/PlacementState";
import { ComplexRegion } from "ReplicatedStorage/Utility/ComplexRegion";
import { ItemRegister } from "ReplicatedStorage/Data/Registers/Items/ItemRegister";
import { GraphicsContext } from "../GraphicsContext";
import { ItemRegistry } from "ReplicatedStorage/Data/Registers/Items/ItemRegistry";
import { getProhibitedScreenRegions, setProhibitedScreenRegion } from "StarterPlayer/StarterPlayerScripts/Placement/ProhibitedRanges";

function placeItem (register: ItemRegister<ItemTraitEnum[], ItemTrait> ) {
	if (PlacementState.Mode === PlacementStatus.Move) return;
	const response = Remotes.Client.Item.CreateItem(register.id).await();
	if (!response[0]) return;
	if (!response[1].isOk()) return;
	const item = Item.Deserialize(LocalUser, response[1].unwrap());
	LocalUser.inventory.items[item.instanceID] = item;
	PlacementState.Item = item;
	PlacementState.Mode = PlacementStatus.Move;
	PlacementState.Degrees = math.deg(PlacementState.Item.model.GetPivot().ToEulerAnglesYXZ()[1]);
	PlacementState.Region = new ComplexRegion(item.model, (part) => !(part.GetAttribute("DoesNotBlockPlacement") as boolean ?? false))
	PlacementState.Item.setCollision(false);
	PlacementState.Item.showPickup(true);
	Remotes.Client.Item.MoveItem(PlacementState.Item!.instanceID)
	moveItem()
}

interface InventoryGUIProps { opened: boolean }
interface InventoryGUIState { opened: boolean, inventory: [string, number][] }

export class InventoryGUI extends Roact.Component<
	InventoryGUIProps,
	InventoryGUIState
> {
	public constructor (props: InventoryGUIProps) {
		super(props);

		this.setState({
			opened: props.opened,
			inventory: [],
		})

		task.spawn(() => {
			Remotes.Client.Item.InformInventoryUpdate.Connect((updates) => {
				const built: [string, number][] = [];
				updates.forEach(([id, count]) => {
					LocalUser.inventory.count[id] = count;
					if (count === 0) {
						// eslint-disable-next-line @typescript-eslint/ban-ts-comment
						// @ts-ignore — We don't want it to show up in the UI, so get rid of it.
						LocalUser.inventory.count[id] = undefined;
					}
				})
				for (const [id, count] of pairs(LocalUser.inventory.count)) {
					built.push([id, count])
				}
				this.setState({ inventory: built })
			})
		})

		GraphicsContext.Bind(["R"], () => {
			this.setState({ opened: !this.state.opened });
		});
	}

	public render() {
		return <frame
			Size={new UDim2(0, 350, 1, 0)}
			Style={Enum.FrameStyle.RobloxSquare}
			Visible={this.state.opened}
		>
			<textlabel
				Text="Inventory"
				TextSize={29}
				TextColor3={Color3.fromRGB(255, 255, 255)}
				BackgroundTransparency={1}
				Size={new UDim2(1, 0,0, 65)}
			/>
			<imagebutton
				Size={new UDim2(0, 45, 0, 45)}
				Image={"http://www.roblox.com/asset/?id=2524572083"}
				Position={new UDim2(1, -45, 0, 5)}
				BackgroundTransparency={1}
				Event={{
					"MouseButton1Click": () => {
						this.setState({ opened: false })
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
				{this.state.inventory.map(([id, count]) => (
					<textbutton
						Event={{
							"MouseButton1Click": () => placeItem(ItemRegistry[id])
						}}
						Text={`(${count}) ${ItemRegistry[id].name}`}
					/>
				))}
			</scrollingframe>
		</frame>;
	}
}
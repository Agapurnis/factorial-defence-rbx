import Roact, { Component } from "@rbxts/roact";
import type { ItemTraitEnum } from "ReplicatedStorage/Enums/ItemTrait";
import type { ItemRegister } from "ReplicatedStorage/Items/ItemRegister";
import type { ItemTrait } from "ReplicatedStorage/Traits/Item/ItemTrait";

interface InventoryItemIconState {}
interface InventoryItemIconProps {
	register: ItemRegister<ItemTraitEnum[], ItemTrait<ItemTraitEnum>>
	Events?: Roact.JsxInstanceEvents<ImageButton | TextButton>
}

export class InventoryItemIcon extends Component<
	InventoryItemIconProps,
	InventoryItemIconState
> {
	constructor (props: InventoryItemIconProps) {
		super(props);
	}

	public render (): Roact.Element {
		return <>
			{
				this.props.register.icon !== undefined
					? <imagebutton Event={this.props.Events || {}} Image={this.props.register.icon} />
					: <textbutton  Event={this.props.Events || {}}  Text={this.props.register.name} />
			}
		</>;
	}
}

import { Item } from "ReplicatedStorage/Classes/Item";

const STYLE_TRANSPARENCY_SURFACE = 0.92;
const STYLE_TRANSPARENCY_BORDER  = 0.8;

const STYLE_COLOR_ERROR = Color3.fromRGB(214, 84, 84);
const STYLE_COLOR_OKAY  = Color3.fromRGB(92, 125, 232);

export const enum SelectionBoxType {
	NONE,
	ERROR,
	NORMAL
}

// TODO: Not re-create if setting to the same type.

export function setSelectionBox (item: Item, boxType: SelectionBoxType): SelectionBox | undefined {
	item.model.FindFirstChildOfClass("SelectionBox")?.Destroy();

	if (boxType === SelectionBoxType.NONE) return;

	const box = new Instance("SelectionBox");
	box.SurfaceTransparency = STYLE_TRANSPARENCY_SURFACE;
	box.Transparency = STYLE_TRANSPARENCY_BORDER;
	applySelectionBoxStyle(box, boxType);
	box.Adornee = item.model;
	box.Parent = item.model;
	return box;
}

/**
 * internal function to style selection boxes
 */
function applySelectionBoxStyle (box: SelectionBox, boxType: SelectionBoxType): void {
	switch (boxType) {
		case SelectionBoxType.ERROR: {
			box.Color3        = STYLE_COLOR_ERROR
			box.SurfaceColor3 = STYLE_COLOR_ERROR
			break
		}
		case SelectionBoxType.NORMAL: {
			box.Color3        = STYLE_COLOR_OKAY
			box.SurfaceColor3 = STYLE_COLOR_OKAY
			break
		}
	}
}
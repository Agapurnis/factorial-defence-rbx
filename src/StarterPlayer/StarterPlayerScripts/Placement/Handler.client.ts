import { Context } from "@rbxts/gamejoy";
import { TweenService, RunService } from "@rbxts/services";
import { PlacementStatus } from "./PlacementStatus";
import { PlacementState } from "./PlacementState";
import { placeItem } from "./Actions/Place";
import { moveItem } from "./Actions/Move";
import { pickItem } from "./Actions/Pick";
import { proxy } from "./PlacementProxy";

const input = new Context();

// Bind rotation events.
input.Bind(["E"], () => { if (PlacementState.Mode === PlacementStatus.Move) { PlacementState.Degrees -= 90; moveItem(); } });
input.Bind(["Q"], () => { if (PlacementState.Mode === PlacementStatus.Move) { PlacementState.Degrees += 90; moveItem(); } });

// Add status toggler based on click events.
input.Bind(["MouseButton1"], () => {
	// A PlacementStatus of 'Lock' means that no interaction should be allowed for UX reasons.
	if (PlacementState.Mode === PlacementStatus.Lock) return;
	// Otherwise, cycle through.
	else if (PlacementState.Mode === PlacementStatus.Move) { placeItem() && (PlacementState.Mode = PlacementStatus.Pick); }
	else if (PlacementState.Mode === PlacementStatus.Pick) { pickItem()  && (PlacementState.Mode = PlacementStatus.Move);}
});

// Bind the main behavior for interactation.
input.Bind(["MouseMovement"], () => {
	// A PlacementStatus of 'Lock' means that no interaction should be allowed for UX reasons.
	if (PlacementState.Mode === PlacementStatus.Lock) return;
	if (PlacementState.Mode === PlacementStatus.Move) moveItem();
});

// We have a constant tween for the moving item.
let tween: Tween;

RunService.Stepped.Connect(() => {
	if (PlacementState.Mode !== PlacementStatus.Move) return;
	if (PlacementState.Item === undefined) return;

	tween?.Destroy();
	tween = TweenService.Create(proxy, new TweenInfo(0.1, Enum.EasingStyle.Cubic, Enum.EasingDirection.Out), {
		Value: PlacementState.Move
	});

	tween.Play();
});

proxy.Changed.Connect(() => {
	if (PlacementState.Mode !== PlacementStatus.Move) return;
	if (PlacementState.Item === undefined) return;
	PlacementState.Item.model.PivotTo(proxy.Value);
});

import { Players, PhysicsService } from "@rbxts/services";
import { CollisionGroup } from "ReplicatedStorage/Data/Enums/CollisionGroup";

/**
 * Adds a collision group to the player's character upon appearance load.
 */
function markCharacter (character: Model) {
	const id = PhysicsService.GetCollisionGroupId(CollisionGroup.Player);

	character.GetDescendants().forEach((descendant) => {
		if (descendant.IsA("BasePart")) {
			descendant.CollisionGroupId = id;
		}
	});
}

Players.PlayerAdded.Connect((player) => {
	if (player.Character) markCharacter(player.Character);
	player.CharacterAppearanceLoaded.Connect(markCharacter);
});

import { Service } from "@flamework/core";
import { CollisionGroup } from "ReplicatedStorage/Enums/CollisionGroup";
import { Players, PhysicsService } from "@rbxts/services";

/**
 * Recursively sets the provided instance and all of it's descendants whom are `BasePart`s' collision group to the provided one.
 */
function setCollisionGroup (instance: Instance, group: string) {
	[instance, ...instance.GetDescendants()].forEach((instance) => {
		if (instance.IsA("BasePart")) {
			PhysicsService.SetPartCollisionGroup(instance, group);
		}
	});
}

/**
 * The service responsible for managing player characters.
 * - Tags the player's character with `CollisionGroup.Player`.
 */
@Service()
export class CharacterService {
	/**
	 * The script connections bound to when a player's character has a new descendant added.
	 */
	private readonly PlayerCharacterDescendantAddedConnections = new Map<Player, RBXScriptConnection>();

	/**
	 * Ensure the player's character will always have all `BasePart` descendants tagged with a `CollisionGroup.Player` collision group.
	 */
	public TagPlayerCollisionGroup (player: Player) {
		// Ideally we wait for the entire character appearance to be loaded so things with parts (e.x.: handles) are also correctly tagged,
		// but we can't can't safely assume that if the 'Character' exists, then everything else already exists, so that event would not be correctly used.
		const character = player.Character || player.CharacterAdded.Wait()[0];
		// To resolve this potential issue, we can wait for children to be added and set the collision group of those.
		// Since this would be pointless if `CharacterAppearanceLoaded` is used, we just use `CharacterAdded` in the previous line.
		this.PlayerCharacterDescendantAddedConnections.set(player, character.DescendantAdded.Connect((descendant) => {
			// Althought it can be thought that it might be unwise to recursively set the group do it as we might cover things we have already done,
			// it is a good idea because some parts may be nil-parented until they are parented to a part which is only then parented to the player,
			// in which case we won't have 100% coverage of everything added. I'm not fully sure it's necessary, but it's best to bese safe.
			// TODO: Confirm assumptions on how `DescendantAdded` works.
			setCollisionGroup(descendant, CollisionGroup.Player);
		}));
		// Of course, we can't forget about initializing the things that are already present.
		setCollisionGroup(character, CollisionGroup.Player);
	}

	constructor () {
		Players.GetPlayers().forEach((player) => {
			this.TagPlayerCollisionGroup(player);

			player.CharacterAppearanceLoaded.Connect(() =>  {
				this.PlayerCharacterDescendantAddedConnections.get(player)!.Disconnect();
				this.TagPlayerCollisionGroup(player);
			});
		});

		Players.PlayerAdded.Connect((player) => {
			this.TagPlayerCollisionGroup(player);
			player.CharacterAppearanceLoaded.Connect(() =>  {
				this.PlayerCharacterDescendantAddedConnections.get(player)!.Disconnect();
				this.TagPlayerCollisionGroup(player);
			});
		});

		Players.PlayerRemoving.Connect((player) => {
			this.PlayerCharacterDescendantAddedConnections.get(player)!.Disconnect();
			this.PlayerCharacterDescendantAddedConnections.delete(player);
		});
	}
}

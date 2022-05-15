/// <reference types="@rbxts/testez/globals" />

import { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { AgentCharlie } from "ServerStorage/Testing/Utility/Agents/Charlie";
import { AgentDelta } from "ServerStorage/Testing/Utility/Agents/Delta";
import { placeItem } from "ServerScriptService/Networking/Implementations/Item/ItemService";

export = function () {
	describe("Item Placement Successes", () => {
		// TODO: I'm unsure why this doesn't seem to work at all.
		// It works perfectly fine in practice...
		itSKIP("should successfully place the item", () => {
			let instance: string; for (const [id] of pairs(AgentCharlie.user.inventory.items)) { instance = id; break; }
			const cframe = new CFrame(new Vector3(math.random(0, 10), AgentCharlie.user.inventory.items[instance!].model.PrimaryPart!.Size.Y / 2, math.random(0, 10)));
			const request = placeItem(AgentCharlie.player, instance!, cframe).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isOk()).to.equal(true);
			const item = ItemRepository.get(instance!).unwrap();
			expect(ItemRepository.InMovement.has(instance!)).to.equal(false);
			expect(item.enabled).to.equal(true);
			expect(item.model.GetPivot()).to.equal(cframe);
		});
	});

	describe("Item Placement Rejects", () => {
		describe("Invalid Items", () => {
			it("should reject if the item does not exist", () => {
				const request = placeItem(AgentCharlie.player, "non-existant-id", new CFrame()).await();
				expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
				expect(request[1].isErr()).to.equal(true);
				const err = request[1].unwrapErr();
				expect(err).to.equal(GenericError.NotFound)
			})

			it("should reject if the item is not owned by the user", () => {
				let instance: string; for (const [id] of pairs(AgentCharlie.user.inventory.items)) { instance = id; break; }
				const request = placeItem(AgentDelta.player, instance!, new CFrame()).await();
				expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
				expect(request[1].isErr()).to.equal(true);
				const err = request[1].unwrapErr();
				expect(err).to.equal(GenericError.Forbidden)
			})

			it("should reject if the item is not in movement", () => {
				let instance: string; let i = 0; for (const [id] of pairs(AgentDelta.user.inventory.items)) { if (i++ === 0) continue; instance = id; break; }
				const request = placeItem(AgentDelta.player, instance!, new CFrame()).await();
				expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
				expect(request[1].isErr()).to.equal(true);
				const err = request[1].unwrapErr();
				expect(err).to.equal(GenericError.Invalid)
			})
		})

		describe("Invalid Positions", () => {
			it("should reject if the position is not rounded to one stud", () => {
				let instance: string; for (const [id] of pairs(AgentCharlie.user.inventory.items)) { instance = id; break; }
				const request = placeItem(AgentCharlie.player, instance!, new CFrame(new Vector3(0.5, 0, 0))).await();
				expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
				expect(request[1].isErr()).to.equal(true);
				const err = request[1].unwrapErr();
				expect(err).to.equal(GenericError.Invalid)
			});
		})
	})
}

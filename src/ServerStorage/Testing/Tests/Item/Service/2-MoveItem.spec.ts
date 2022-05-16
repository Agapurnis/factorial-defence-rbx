/// <reference types="@rbxts/testez/globals" />

import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { moveItem } from "ServerScriptService/Networking/Implementations/Item/ItemService";
import { AgentCharlie } from "ServerStorage/Testing/Utility/Agents/Charlie";
import { AgentDelta } from "ServerStorage/Testing/Utility/Agents/Delta";

export = function () {
	describe("Item Movement Successes", () => {
		it("should successfully set the item to be in movement", () => {
			let instance: string; for (const [id] of pairs(AgentCharlie.user.inventory.items)) { instance = id; break; }
			const request = moveItem(AgentCharlie.player, instance!);
			expect(request.isOk()).to.equal(true);
			expect(ItemRepository.get(instance!).unwrap().enabled).to.equal(false);
			expect(ItemRepository.InMovement.has(instance!)).to.equal(true);
		});
	});

	describe("Item Movement Rejects", () => {
		it("should reject if the item does not exist", () => {
			const request = moveItem(AgentCharlie.player, "non-existant-id");
			expect(request.isErr()).to.equal(true);
			const err = request.unwrapErr();
			expect(err).to.equal(GenericError.NotFound);
		});

		it("should reject if the item is not owned by the user", () => {
			let instance: string; for (const [id] of pairs(AgentCharlie.user.inventory.items)) { instance = id; break; }
			const request = moveItem(AgentDelta.player, instance!);
			expect(request.isErr()).to.equal(true);
			const err = request.unwrapErr();
			expect(err).to.equal(GenericError.Forbidden);
		});
	});
};

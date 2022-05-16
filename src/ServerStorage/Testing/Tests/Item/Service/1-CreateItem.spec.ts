/// <reference types="@rbxts/testez/globals" />

import { ItemRepository } from "ServerScriptService/Networking/Implementations/Item/ItemRepository";
import { UserRepository } from "ServerScriptService/Networking/Implementations/User/UserRepository";
import { createItem } from "ServerScriptService/Networking/Implementations/Item/ItemService";
import { AgentCharlie } from "ServerStorage/Testing/Utility/Agents/Charlie";
import { ITEM_BELOW_28500_ABOVE_20000, ITEM_BELOW_500_ABOVE_5 } from "./items";
import { AgentDelta } from "ServerStorage/Testing/Utility/Agents/Delta";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";

export = function () {
	describe("Item Creation Successes", () => {
		it("(#1) should successfully create an item if it is in their inventory", () => {
			const request = createItem(AgentCharlie.player, ITEM_BELOW_28500_ABOVE_20000.id);
			expect(request.isOk()).to.equal(true);
			const data = request.unwrap();
			const item = ItemRepository.get(data.instanceID);
			expect(item).to.never.equal(undefined);
			expect(UserRepository.get(AgentCharlie.user.player.UserId).unwrap().inventory.items[data.instanceID]).to.be.ok();
			expect(UserRepository.get(AgentCharlie.user.player.UserId).unwrap().inventory.count[data.registerID]).to.equal(0);
		});

		it("(#2) should successfully create an item if it is in their inventory", () => {
			const request = createItem(AgentDelta.player, ITEM_BELOW_500_ABOVE_5.id);
			expect(request.isOk()).to.equal(true);
			const data = request.unwrap();
			const item = ItemRepository.get(data.instanceID);
			expect(item).to.never.equal(undefined);
			expect(UserRepository.get(AgentDelta.user.player.UserId).unwrap().inventory.items[data.instanceID]).to.be.ok();
			expect(UserRepository.get(AgentDelta.user.player.UserId).unwrap().inventory.count[data.registerID]).to.equal(1);
		});

		it("(#3) should successfully create an item if it is in their inventory", () => {
			const request = createItem(AgentDelta.player, ITEM_BELOW_500_ABOVE_5.id);
			expect(request.isOk()).to.equal(true);
			const data = request.unwrap();
			const item = ItemRepository.get(data.instanceID);
			expect(item).to.never.equal(undefined);
			expect(UserRepository.get(AgentDelta.user.player.UserId).unwrap().inventory.items[data.instanceID]).to.be.ok();
			expect(UserRepository.get(AgentDelta.user.player.UserId).unwrap().inventory.count[data.registerID]).to.equal(0);
		});
	});

	describe("Item Creation Rejects", () => {
		it("should reject the request if they do not own the item", () => {
			const request = createItem(AgentCharlie.player, ITEM_BELOW_28500_ABOVE_20000.id);
			expect(request.isErr()).to.equal(true);
			const err = request.unwrapErr();
			expect(err).to.equal(GenericError.Forbidden);
		});
		it("should reject if the item does not exist", () => {
			const request = createItem(AgentCharlie.player, "non-existant-id");
			expect(request.isErr()).to.equal(true);
			const err = request.unwrapErr();
			expect(err).to.equal(GenericError.NotFound);
		});
	});
};

/// <reference types="@rbxts/testez/globals" />

import { ITEM_BELOW_28500_ABOVE_20000, ITEM_BELOW_500_ABOVE_5 } from "./items";
import { ItemPurchaseError } from "ReplicatedStorage/Networking/Definitions/Item/PurchaseItem";
import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { purchaseItem } from "ServerScriptService/Networking/Implementations/Item/ItemService";
import { AgentCharlie } from "ServerStorage/Testing/Utility/Agents/Charlie";
import { AgentDelta } from "ServerStorage/Testing/Utility/Agents/Delta";

export = function () {
	describe("Item Purchase Successes", () => {
		it("(#1) should successfully purchase an item they can afford", () => {
			const request = purchaseItem(AgentCharlie.player, ITEM_BELOW_28500_ABOVE_20000.id).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isOk()).to.equal(true);
		})
		it("(#2) should successfully purchase an item they can afford", () => {
			const request = purchaseItem(AgentCharlie.player, ITEM_BELOW_500_ABOVE_5.id).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isOk()).to.equal(true);
		})
		it("(#3) should successfully purchase an item they can afford", () => {
			const request = purchaseItem(AgentDelta.player, ITEM_BELOW_500_ABOVE_5.id).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isOk()).to.equal(true);
		})
		it("(#4) should successfully purchase an item they can afford", () => {
			const request = purchaseItem(AgentDelta.player, ITEM_BELOW_500_ABOVE_5.id).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isOk()).to.equal(true);
		})
	})

	describe("Item Purchase Rejects", () => {
		it("should reject when a user attempts to purchase an item they cannot afford", () => {
			const request = purchaseItem(AgentDelta.player, ITEM_BELOW_28500_ABOVE_20000.id).await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isErr()).to.equal(true);
			expect(request[1].unwrapErr()).to.equal(ItemPurchaseError.NotEnoughMoney);
		})
		it("should reject when a user attempts to purchase a non-existant item", () => {
			const request = purchaseItem(AgentDelta.player, "not-an-id").await();
			expect(request[0]).to.equal(true); if (!request[0]) { return; /* ts */ }
			expect(request[1].isErr()).to.equal(true);
			expect(request[1].unwrapErr()).to.equal(GenericError.NotFound);
		})
	})

}

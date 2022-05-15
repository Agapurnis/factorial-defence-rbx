import { AgentCharlie } from "ServerStorage/Testing/Utility/Agents/Charlie"
import { AgentDelta } from "ServerStorage/Testing/Utility/Agents/Delta"

export = function () {
	describe("__cleanup__", () => {
		it("_", () => {
			for (const [_, item] of pairs(AgentCharlie.user.inventory.items)) { item.model.Destroy() }
			for (const [_, item] of pairs(AgentDelta.user.inventory.items))   { item.model.Destroy() }
			expect(true).to.equal(true)
		})
	})
}

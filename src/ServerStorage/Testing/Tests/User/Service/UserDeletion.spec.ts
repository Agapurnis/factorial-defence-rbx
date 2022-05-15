/// <reference types="@rbxts/testez/globals" />

import { deleteUser } from "ServerScriptService/Networking/Implementations/User/UserService";
import { AgentBeta } from "ServerStorage/Testing/Utility/Agents/Beta";

export = function () {
	describe("User Deletion Successes", () => {
		it("should successfully create a user", () => {
			const agent = AgentBeta
			const calld = deleteUser(agent.player).await();

			expect(calld[0] === false);
			expect(calld[1] === true)
		})
	})

	describe("User Deletion Rejects", () => {
		it("should not delete a user who does not have an account", () => {
			const agent = AgentBeta
			const calld = deleteUser(agent.player).await();

			expect(calld[0] === false);
			expect(calld[1] === false)
		})
	})
}

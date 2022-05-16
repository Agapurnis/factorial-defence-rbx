/// <reference types="@rbxts/testez/globals" />

import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { AgentAlpha } from "ServerStorage/Testing/Utility/Agents/Alpha";
import { AgentBeta } from "ServerStorage/Testing/Utility/Agents/Beta";
import { loadUser } from "ServerScriptService/Networking/Implementations/User/UserService";

export = function () {
	describe("User Load Successes", () => {
		it("should successfully load a user", () => {
			const agent = AgentAlpha;
			const calld = loadUser(agent.player).await();

			expect(calld[0] === true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(false);

			const data = calld[1].unwrap();

			expect(data).to.be.ok();
		});
	});

	describe("User Load Rejects", () => {
		it("should reject if a user does not exist", () => {
			const agent = AgentBeta;
			const calld = loadUser(agent.player).await();

			expect(calld[0] === true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(true);

			const data = calld[1].unwrapErr();

			expect(data).to.equal(GenericError.NotFound);
		});
	});
};

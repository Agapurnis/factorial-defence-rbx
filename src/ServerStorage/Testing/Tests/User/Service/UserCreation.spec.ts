/// <reference types="@rbxts/testez/globals" />

import { GenericError } from "ReplicatedStorage/Networking/Shared/GenericError";
import { createUser } from "ServerScriptService/Networking/Implementations/User/UserService";
import { AgentAlpha } from "ServerStorage/Testing/Utility/Agents/Alpha";
import { AgentBeta } from "ServerStorage/Testing/Utility/Agents/Beta";

export = function () {
	describe("User Creation Successes", () => {
		it("(#1) should successfully create a user", () => {
			const agent = AgentAlpha;
			const calld = createUser(agent.player).await();

			expect(calld[0]).to.equal(true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(false);

			const data = calld[1].unwrap();

			expect(data).to.be.ok();
		});

		it("(#2) should successfully create a user", () => {
			const agent = AgentBeta;
			const calld = createUser(agent.player).await();

			expect(calld[0]).to.equal(true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(false);

			const data = calld[1].unwrap();

			expect(data).to.be.ok();
		});
	});

	describe("Use Creation Rejects", () => {
		it("(#1) should not create a user who already had an account", () => {
			const agent = AgentAlpha;
			const calld = createUser(agent.player).await();

			expect(calld[0]).to.equal(true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(true);

			const data = calld[1].unwrapErr();

			expect(data).to.equal(GenericError.AlreadyExists);
		});

		it("(#2) should not create a user who already had an account", () => {
			const agent = AgentBeta;
			const calld = createUser(agent.player).await();

			expect(calld[0]).to.equal(true); if (!calld[0]) { return; /* ts */ }
			expect(calld[1].isErr()).to.equal(true);

			const data = calld[1].unwrapErr();

			expect(data).to.equal(GenericError.AlreadyExists);
		});
	});
};

/// <reference types="@rbxts/testez/globals" />

import Migration from "ServerStorage/Migrations/MigrationList/1659048211997";

const Previous: Parameters<typeof Migration["Migrate"]>[0] = {
	// ...
	Balance: {
		"CREDITS": 153,
		"TICKETS": 0,
		"DOLLARS": 14,
	}
	// ...
};

export = function () {
	const Transformed = Migration.Migrate(Previous);

	it("renames the currency 'CREDITS' to 'PREMIUM'", () => {
		expect(Transformed.Balance.PREMIUM).to.equal(Previous.Balance.CREDITS);
	});

	it("renames the currency 'DOLLARS' to 'CREDITS'", () => {
		expect(Transformed.Balance.CREDITS).to.equal(Previous.Balance.DOLLARS);
	});

	it("removes the old and unused currency balances'", () => {
		const PermissiveAccess = Migration.AsTransitional(Transformed);
		expect(PermissiveAccess.Balance!.TICKETS).to.equal(undefined);
		expect(PermissiveAccess.Balance!.DOLLARS).to.equal(undefined);
	});
};

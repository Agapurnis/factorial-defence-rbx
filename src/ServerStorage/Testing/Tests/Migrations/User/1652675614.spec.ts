import { getMigratable, setMigratable } from "./.tracked";
import { DEFAULT_BASE_ORE_LIMIT } from "ReplicatedStorage/Utility/DefaultOreLimit";
import migrate from "ServerScriptService/Storage/Migrations/User/1652675614";

export = function () {
	it("should merge add a ore limit under `limit`", () => {
		const migratable = getMigratable() as Parameters<typeof migrate>[0];
		const migrated: ReturnType<typeof migrate> = migrate(migratable);
		const expected: ReturnType<typeof migrate> = { ...migratable, limit: DEFAULT_BASE_ORE_LIMIT };
		setMigratable(migrated);
		expect(migrated.limit).to.equal(expected.limit);
	});
};

import { getMigratable, setMigratable } from "./.tracked";
import migrate from "ServerScriptService/Storage/Migrations/User/1652050437";

export = function () {
	it("should merge `inventory` and `placed` into `inventory`", () => {
		const migratable = getMigratable() as Parameters<typeof migrate>[0];
		const migrated: ReturnType<typeof migrate> = migrate(migratable)
		const expected: ReturnType<typeof migrate> = { ...migratable, placed: undefined, inventory: { count: migratable.inventory, items: migratable.placed } }
		setMigratable(migrated);
		expect(migrated.placed).to.be.never.ok();
		for (const [itemkey] of pairs(migrated.inventory.items)) {
			expect(migrated.inventory.count[itemkey]).to.equal(expected.inventory.count[itemkey])
			expect(migrated.inventory.items[itemkey]).to.equal(expected.inventory.items[itemkey])
		}
	})
}

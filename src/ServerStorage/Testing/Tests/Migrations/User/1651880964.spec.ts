import { getMigratable, setMigratable } from "./.tracked";
import { PlacementBehavior } from "ReplicatedStorage/Data/Enums/Settings/PlacemodeBehavior";
import migrate from "ServerScriptService/Storage/Migrations/User/1651880964";

export = function () {
	it("should add the user settings property and its contents", () => {
		const migratable = getMigratable() as {};
		const migrated = migrate(migratable) as typeof expected
		const expected = { ...migratable, settings: { placement: { behavior: [PlacementBehavior.OFF_OF_TARGET, true] as [PlacementBehavior, boolean] } } };
		setMigratable(migrated);
		expect(migrated.settings).to.be.ok();
		expect(migrated.settings.placement.behavior[0]).to.equal(expected.settings.placement.behavior[0])
		expect(migrated.settings.placement.behavior[1]).to.equal(expected.settings.placement.behavior[1])
	})
}

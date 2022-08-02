import { Service } from "@flamework/core";
import { ServerStorage } from "@rbxts/services";
import { MigrationSpecification } from "ServerStorage/Migrations/MigrationSpecification";

@Service()
export class MigrationRetrievalService {
	private static readonly MIGRATION_FOLDER = ServerStorage
		.WaitForChild("TS")!
		.WaitForChild("Migrations")!
		.WaitForChild("MigrationList") as Folder;
	public readonly MigrationList = MigrationRetrievalService.MIGRATION_FOLDER.GetDescendants()
		.filter((descendant): descendant is ModuleScript => descendant.IsA("ModuleScript"))
		.map((descendant) => {
			const migration = require(descendant);
			assert(migration !== undefined, `Migration @${descendant.Name} must export a \`MigrationSpecification\`!`) as never;
			assert(migration instanceof MigrationSpecification, `Migration @${descendant.Name} export be a \`MigrationSpecification\`!`);
			return migration as unknown as MigrationSpecification;
		});

	/**
	 * Returns all migrations that should occur after the given UTC millisecond timestamp, in ascending order.
	 */
	public GetMigrationsFromUTC (utc: number): MigrationSpecification[] {
		return this.MigrationList
			.filter(({ Timestamp }) => Timestamp > utc)
			.sort((a, b) => a.Timestamp < b.Timestamp);
	}
}


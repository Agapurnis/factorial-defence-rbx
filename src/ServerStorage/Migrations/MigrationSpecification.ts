import type { MigratableDataStructure } from "ReplicatedStorage/Enums/MigratableDataStructure";

type RecursivePartial <T> = { [K in keyof T]?: T[K] extends Record<string, unknown> ? RecursivePartial<T[K]> : T[K] };

function RecursiveClone <T> (thing: T): T  {
	if (!typeIs(thing, "table")) return thing;
	const clone = {} as T;
	for (const [key, value] of pairs(thing)) {
		clone[key as keyof T] = typeIs(thing, "table")
			? RecursiveClone(value as Record<string, unknown>) as unknown as T[keyof T]
			: value as T[keyof T];
	}
	return clone;
}

export class MigrationSpecification <
	__OLD = never,
	__NEW = never,
> {
	/**
	 * The timestamp of the migration, in milliseconds (UTC).
	 */
	public readonly Timestamp: number;

	constructor (
		/**
		 * The source container that holds the migration.
		 */
		private readonly SourceContainer: LuaSourceContainer,
		/**
		 * The scope/target of the transformation.
		 */
		public readonly Scope: MigratableDataStructure,
		/**
		 * The inner migration transformer function itself.
		 */
		private readonly Transform: (
			previous: Readonly<__OLD>,
			transformed:
				& RecursivePartial<__OLD>
				& RecursivePartial<__NEW>
		) => typeof transformed
	) {
		const ModuleScript = this.SourceContainer;
		assert(SourceContainer.IsA("ModuleScript"), `migration SourceContainer must be a ModuleScript`);
		const TimeStamp = tonumber(ModuleScript.Name);
		assert(TimeStamp, `unable to convert migration script name '${ModuleScript.Name}' to a timestamp!`);
		this.Timestamp = TimeStamp;
	}

	/**
	 * Returns the input but with a transitional typing.
	 */
	public AsTransitional (migrated: __NEW) {
		return migrated as
			& RecursivePartial<__OLD>
			& RecursivePartial<__NEW>;
	}

	/**
	 * Returns a migrated clone of the given input, not mutating the actual input.
	 */
	public Migrate (old: __OLD): __NEW {
		// We're gonna rely on testing for safety, unfortunately.
		return this.Transform(old, RecursiveClone(old)) as __NEW;
	}
}

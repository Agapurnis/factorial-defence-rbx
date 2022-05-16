import { DEFAULT_BASE_ORE_LIMIT } from "ReplicatedStorage/Utility/DefaultOreLimit";

interface Previous {}
interface Migrated {
	limit: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export = function (previous: Previous): Migrated {
	const current = { ...previous };
	(current as unknown as Partial<Migrated>).limit = DEFAULT_BASE_ORE_LIMIT;
	return current as unknown as Migrated;
};

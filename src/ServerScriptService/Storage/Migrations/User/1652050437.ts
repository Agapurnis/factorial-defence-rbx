interface Previous {
	inventory: Record<string, number>
	placed: Record<string, unknown>
}

interface Migrated {
	placed: undefined;

	inventory: {
		items: Record<string, unknown>
		count: Record<string, number>
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export = function (previous: Previous): Migrated {
	const current = { ...previous };
	const items = previous.placed;
	const count = previous.inventory;
	(current as unknown as Partial<Previous>).placed = undefined;
	(current as unknown as Partial<Migrated>).inventory = {
		items,
		count
	};
	return current as unknown as Migrated;
};

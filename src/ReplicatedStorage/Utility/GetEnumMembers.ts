type SymmetricEnumType <
	K extends string,
	V extends string | number
> = Record<K, V> & Record<V, K>;

/**
 * @internal
 */
const SymmetricEnumMemberCache = new Map<SymmetricEnumType<string, string | number>, string[]>();

export function getSymmetricEnumMembers <
	K extends string,
	V extends string | number
> (holder: SymmetricEnumType<K, V>): Array<K & V> {
	if (SymmetricEnumMemberCache.has(holder)) {
		return SymmetricEnumMemberCache.get(holder)! as Array<K & V>;
	}
	const output: Array<K & V> = [];
	for (const [key, value] of pairs(holder as Record<string, string | number>)) {
		assert(key === value, `Enum is not symmetrical! Expected \`${key}\` to equal \`${value}\`.`);
		output.push(key as K & V);
	}
	SymmetricEnumMemberCache.set(holder, output);
	return output;
}

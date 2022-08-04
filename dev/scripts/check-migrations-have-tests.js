// @ts-check
const { readdir } = require("fs/promises");
const { resolve } = require("path");

const IMPL_PATH = resolve(__dirname, "../../", "src/ServerStorage/Migrations/MigrationList/");
const TEST_PATH = resolve(__dirname, "../../", "src/ServerStorage/Migrations/MigrationTests/");

//

/**
 * @param { string   } path - Directory to start from.
 * @param { string[] } [found=[]] - Internal collection parameter which accumulates the found files, not guaranteed to be in any particular order.
 * @returns { Promise<string[]> } A list of absolute paths to all found files.
 */
async function recursiveReaddir (path, found = []) {
	/**
	 * Sub-promises to await before resolving.
	 *
	 * @type { ReturnType<recursiveReaddir>[] }
	 */
	const awaiting = [];

	for (const dirent of await readdir(path, { withFileTypes: true })) {
		const _path = resolve(path, dirent.name);

		if (found.includes(_path)) {
			continue;
		}

		if (dirent.isDirectory()) {
			awaiting.push(recursiveReaddir(_path, found));
		} else if (dirent.isFile()) {
			found.push(_path)
		}
	}

	await Promise.all(awaiting);

	return found;
}

const COLOR_RED   = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[31m";
const COLOR_GREEN = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[32m";
const COLOR_RESET = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[0m";

(async () => {
	const [impl, test] = await Promise.all([
		recursiveReaddir(IMPL_PATH),
		recursiveReaddir(TEST_PATH),
	])

	const missing = impl
		.filter((migration) => !test.includes(migration))
		.map((migration) => migration.replace(IMPL_PATH + "/", ""));

	if (missing.length === 0) {
		process.stdout.write(`${COLOR_GREEN}All migrations have tests! :)${COLOR_RESET}`);
		process.stdout.write("\n");
		process.exit(0);
	} else {
		process.stderr.write("You are missing tests for the following migrations!:\n" + missing.map((missing) => `  - ${COLOR_RED}${missing}${COLOR_RESET}`).join("\n"));
		process.stdout.write("\n")
		process.exit(1)
	}
})();

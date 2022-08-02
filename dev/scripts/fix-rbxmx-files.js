// @ts-check
const { writeFile, readFile, readdir } = require("fs/promises");
const { resolve } = require("path");

/**
 * Entrypoint to begin processing.
 */
const entry = resolve(__dirname + "/../../src/")

/**
 * The target extension.
 */
const extension = ".rbxmx";

//

/**
 * Whether or not to output progress to the console.
 */
const verbose = process.argv.some((argv) => argv.toLowerCase() === "--verbose");
/**
 * Whether or not to log completion in the console.
 */
const silent = process.argv.some((argv) => argv.toLowerCase() === "--silent");

//

/**
 * How many files were processed.
 */
let processed = 0;
/**
 * How many targeted files were scanned..
 */
let scanned = 0;

/**
 * @param { string } path - Directory to start from.
 * @param { Set<string> } [found] - Internal collection parameter which accumulates the found files, not guaranteed to be in any particular order.
 * @returns { Promise<void> } A list of absolute paths to all found files.
 */
async function recursiveProcess (path, found = new Set()) {
	/**
	 * Sub-promises to await before resolving.
	 *
	 * @type { ReturnType<recursiveProcess>[] }
	 */
	const awaiting = [];

	for (const dirent of await readdir(path, { withFileTypes: true })) {
		const _path = resolve(path, dirent.name);

		if (found.has(_path)) {
			continue;
		}

		found.add(_path);

		if (dirent.isDirectory()) {
			awaiting.push(recursiveProcess(_path, found));
		} else if (dirent.isFile()) {
			if (_path.endsWith(extension)) {
				awaiting.push(
					readFile(_path, "utf8")
						.then((data) => clean(data))
						.then(([data, changed]) => changed && (writeFile(_path, data, "utf8"), changed))
						.then((changed) => {
							scanned += 1;

							if (changed) {
								processed += 1;

								if (verbose) {
									process.stdout.write(`Processed '${_path}'\n`);
								}
							} else if (verbose) {
								process.stdout.write(`No changes needed for '${_path}'\n`);
							}
						})
				)
			}
		}
	}

	await Promise.all(awaiting);
}

recursiveProcess(entry).then(() => {
	if (!silent) {
		if (verbose) {
			process.stdout.write("\n");
		}

		if (processed > 0) {
			process.stdout.write(`Successfully processed ${processed} '${extension}' files.\n`);
		} else if (scanned > 0) {
			process.stdout.write("No files were changed, as none needed to be.\n");
		} else {
			process.stdout.write("No files were changed, as no files were found.\n");
		}
	}
})

/**
 * @param { string } data
 * @returns { [cleaned: string, changed: boolean] }
 */
function clean (data) {
	const cleaned = data.replace(/\s*<int64 name="SourceAssetId">-?\d+<\/int64>/gm, "");
	const changed = data !== cleaned;
	return [cleaned, changed];
}

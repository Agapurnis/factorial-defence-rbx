// @ts-check
const { rm } = require("fs");

/**
 * Whether or not to log completion in the console.
 */
const silent = process.argv.some((argv) => argv.toLowerCase() === "--silent");

rm(__dirname + "/../../node_modules/@rbxts/basicstate/node_modules", { recursive: true }, (error) => {
	if (error) {
		if (error.code === "ENOENT") {
			if (!silent) {
				process.stdout.write("The dependencies of '@rbxts/basicstate' have already been removed!\n");
			}

			process.exit(0);
		}

		throw error;
	}

	if (!silent) {
		process.stdout.write("Removed the dependencies of '@rbxts/basicstate'!\n");
	}

	process.exit(0);
});

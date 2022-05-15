const fs = require("fs");
const path = require("path");

function recursiveNonIndexTSFiles (path) {
	let arr = [];

	fs.readdirSync(path).forEach(file => {
		if (fs.statSync(path + "/" + file).isDirectory()) {
			arr = arr.concat(recursiveNonIndexTSFiles(path + "/" + file));
		} else if (file.endsWith(".ts") && !file.startsWith("index.ts")) {
			arr.push(file.replace(".spec", ""));
		}
	})

	return arr
}

const COLOR_RED   = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[31m";
const COLOR_GREEN = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[32m";
const COLOR_RESET = process.env.NO_COLOR || process.argv[2]?.toLowerCase() === "--no-color" ? "" : "\x1b[0m";

if (__dirname.includes(" ")) throw new Error("Path to directory cannot contain a space!")
const impl = recursiveNonIndexTSFiles(path.resolve(__dirname, "../", "src/ServerScriptService/Storage/Migrations"));
const test = recursiveNonIndexTSFiles(path.resolve(__dirname, "../", "src/ServerStorage/Testing/Tests/Migrations"));
const missing = impl.filter((migration) => !test.includes(migration));

if (missing.length === 0) {
	process.stdout.write(`${COLOR_GREEN}All migrations have tests! :)${COLOR_RESET}`);
	process.stdout.write("\n");
	process.exit(0);
} else {
	process.stderr.write("You are missing tests for the following migrations!:\n" + missing.map((missing) => `  - ${COLOR_RED}${missing}${COLOR_RESET}`).join("\n"));
	process.stdout.write("\n")
	process.exit(1)
}

#!/usr/bin/env node
import { OneType, TypesContainer } from "./types";
import { readdirSync, writeFileSync } from "fs";

import { generateTypes } from "./generation";
import { join } from "path";
import { parseFile } from "./file";

let inputFolder = "";
let outputFile = "";

process.argv.forEach(function (arg, index) {
	if (arg === "-i") {
		inputFolder = process.argv[index + 1];
	}
	if (arg === "-o") {
		outputFile = process.argv[index + 1];
	}
});

if (!inputFolder) {
	console.error("inputFolder must be specified");
	process.exit(1);
}

if (!outputFile) {
	console.error("outputFile must be specified");
	process.exit(1);
}

const files = readdirSync(inputFolder);

(async function () {
	const typesContainer: TypesContainer = {
		types: new Map<string, OneType>()
	};

	for (const file of files) {
		if (!file.endsWith(".proto")) {
			continue;
		}

		const filePath = join(inputFolder, file);

		await parseFile(filePath, typesContainer);
	}

	const output = generateTypes(typesContainer);

	writeFileSync(outputFile, output, {
		encoding: "utf8"
	});
}());


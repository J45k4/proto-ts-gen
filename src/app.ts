#!/usr/bin/env node
import { writeFileSync } from 'fs';
import { convertFileToText, convertToGenerationStructure } from './generation';
import { parseDirectory } from './parsing';
import { join } from "path"
import { ensureDir, ensureFile } from "fs-extra"

let inputFolder = ""
let outputFolder = ""

const messagesToSkip: string[] = [];

process.argv.forEach(function (arg, index) {
	if (arg === '-i') {
		inputFolder = process.argv[index + 1]
	}
	if (arg === '--skip-message') {
		messagesToSkip.push(process.argv[index + 1]);
	}
	if (arg === "-o") {
		outputFolder = process.argv[index + 1]
	}
});

if (!inputFolder) {
	throw new Error("Inputfolder not set")
}

if (!outputFolder) {
	throw new Error("Outputfolder not set")
}

(async () => {
	const allTypes = await parseDirectory(inputFolder, messagesToSkip)

	const generation = convertToGenerationStructure(allTypes)

    for (const [path,f] of generation.files) {
        const o = convertFileToText(f)

		const fullFilepath = join(outputFolder, path)

		console.log("CREATING FILE", path)

		// const parts = path.split("/")
		// parts.pop()

		// // const parts = join(outputFolder, path).split("/")
		// // parts.pop()

		// const outputFileFolderPath = join(outputFolder, parts.join("/"))

		// console.log("OUTPUT FOLDER", outputFileFolderPath)

		await ensureFile(fullFilepath)

		writeFileSync(fullFilepath, o, {
			encoding: "utf8"
		})
    }
})()
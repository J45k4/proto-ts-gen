#!/usr/bin/env node
import { readdirSync, statSync, writeFileSync } from 'fs';

import { parseFile } from './file';

let inputFolder = '';

const messagesToSkip: string[] = [];

process.argv.forEach(function (arg, index) {
	if (arg === '-i') {
		inputFolder = process.argv[index + 1];
	}
	if (arg === '--skip-message') {
		messagesToSkip.push(process.argv[index + 1]);
	}
});

if (!inputFolder) {
	inputFolder = '.';
}

async function loadDirectory(currentDirectory: string): Promise<void> {
	const files = readdirSync(currentDirectory);
	for (const file of files) {
		const filePath = `${currentDirectory}/${file}`;
		if (statSync(filePath).isDirectory()) {
			loadDirectory(filePath);
		} else if (file.endsWith('.proto')) {
			console.log('PARSE', filePath);
			await parseFile(filePath, inputFolder, messagesToSkip);
		}
	};
}

loadDirectory(inputFolder)
	.then(() => console.log('Done.'))
	.catch((err) => console.error(err));

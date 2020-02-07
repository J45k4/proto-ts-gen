import { common, Root, util } from "protobufjs";
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { OneType, TypesContainer } from "./types";
import { parse } from "./parse";
import { generateTypes } from './generation';

const mainFiles = [];

export const parseFile = async (
    filePath: string, rootPath: string, messagesToSkip: string[]
) => new Promise((resolve, reject) => {
    const root = new Root();
    root.resolvePath = function pbjsResolvePath(origin, target) {
        var normOrigin = util.path.normalize(origin);
        var normTarget = util.path.normalize(target);
        if (!normOrigin) {
            mainFiles.push(normTarget);
        }

        var resolved = util.path.resolve(normOrigin, normTarget, true);
        var idx = resolved.lastIndexOf("google/");
        if (idx > -1) {
            var altname = resolved.substring(idx);
            if (altname in common) {
                resolved = altname;
            }
        }

        if (existsSync(resolved)) {
            return resolved;
        }

        if (existsSync(join(rootPath, target))) {
            return join(rootPath, target);
        }

        return resolved;
    };

    root.load(filePath, (err) => {
        if (err) {
            console.error("ERROR while loading protofile " + filePath, err);
            process.exit(1);
        }
        const typesContainer: TypesContainer = {
            types: new Map<string, OneType>()
        };

        parse(root, typesContainer, messagesToSkip);

        const output = generateTypes(typesContainer);
        writeFileSync(filePath.replace('.proto', '-interfaces.ts'), output, {
            encoding: 'utf8'
        });

        resolve();
    });
});
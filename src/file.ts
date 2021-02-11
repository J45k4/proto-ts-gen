import { common, Root, util } from "protobufjs";
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';

import { AllTypes, OneType, TypeRepository, TypesContainer } from "./types";
import { parse } from "./parsing";
// import { generateTypes } from './generation';

const mainFiles = [];

export const parseFile = async (
    allTypes: AllTypes,
    filePath: string, 
    rootPath: string, 
    messagesToSkip: string[]
) => new Promise<void>((resolve, reject) => {
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
            return '';
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

        parse(root, allTypes, messagesToSkip);

        // const output = generateTypes(typesContainer);
        // writeFileSync(filePath.replace('.proto', '-interfaces.ts'), output, {
        //     encoding: 'utf8'
        // });

        resolve();
    });
});
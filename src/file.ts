import { TypesContainer } from "./types";
import { load } from "protobufjs";
import { parse } from "./parse";

export const parseFile = async (
    filePath: string, typesContainer: TypesContainer
) => new Promise((resolve, reject) => {
    load(filePath, (err, root) => {
        if (err) {
            console.error("ERROR while loading protofile " + filePath, err);
            process.exit(1);
        }

        parse(root, typesContainer);
        resolve();
    });
});
import { readdirSync, statSync, existsSync } from 'fs';
import { relative } from 'path';
import { Enum, Namespace, Root, Service, Type, util } from "protobufjs";
import { AllTypes, Field, FlatType } from "./types";

const invalidPathCharactersRegex = /(\\)|(\.)/g;

export const getTypes = (
    rootFolderPath: string,
    type: Type | Enum | Namespace, 
    allTypes: Map<string, FlatType>, 
    messagesToSkip: string[]
) => {
    if (!(type instanceof Type) && type instanceof Namespace) {
        for (const subType of type.nestedArray) {
            getTypes(rootFolderPath, subType as Type, allTypes, messagesToSkip);
        }

        return;
    }

    const fullname = type.fullName.substring(1);

    const parts = fullname.split(".")

    const name = parts.pop()

    const filepath = relative(rootFolderPath, type.filename);
    const namespace = filepath.replace(invalidPathCharactersRegex, "_") //.split(".").join("_").split("/").join("_")

    // if (typeRepository.hasType(type.filename, type.name)) {
    //     return
    // }

    const flatType: FlatType = {
        name: name,
        namespace: namespace,
        filepath: filepath,
        fields: []
    }

    if (type instanceof Type) {
        if (messagesToSkip.includes(type.name)) {
            return;
        }

        for (const subType of type.nestedArray) {
            getTypes(rootFolderPath, subType as Type, allTypes, messagesToSkip);
        }

        for (const field of type.fieldsArray) {
            const name = field.name 

            const newField: Field = {
                name: field.name,
                type: field.type,
                isListType: field.repeated,
                required: field.required,
            };

            flatType.fields.push(newField)
        }
    }

    if (type instanceof Enum) {
        flatType.isEnum = true

        Object.keys(type.values).forEach(key => {
            const enumValue = type.values[key];

            const newField: Field = {
                name: key,
                value: enumValue,
                isListType: false,
                required: false,
            };

            flatType.fields.push(newField);
        });
    }

    allTypes.set(fullname, flatType);
}

export const parse = (rootFolderPath: string, root: Root, allTypes: AllTypes, messagesToSkip: string[]) => {
    for (const nestedItem of root.nestedArray) {
        if (nestedItem instanceof Service) {
            continue;
        }

        getTypes(rootFolderPath, nestedItem as Type, allTypes, messagesToSkip);
    }
}

export const parseFile = async (rootFolderPath: string, allTypes: AllTypes, filePath: string, messagesToSkip: string[]) => new Promise<void>((resolve, reject) => {
    const root = new Root();
    root.resolvePath = function pbjsResolvePath(origin, target) {
        var normOrigin = util.path.normalize(origin);
        var normTarget = util.path.normalize(target);

        var resolved = util.path.resolve(normOrigin, normTarget, true);
        var idx = resolved.lastIndexOf("google/");
        if (idx > -1) {
            return '';
        }

        if (existsSync(resolved)) {
            return resolved;
        }

        return resolved;
    };

    root.load(filePath, (err) => {
        if (err) {
            console.error("ERROR while loading protofile " + filePath, err);
            process.exit(1);
        }

        parse(rootFolderPath, root, allTypes, messagesToSkip);

        resolve();
    });
})

const parseOneDirectory = async (rootFolderPath: string, allTypes: AllTypes, currentDirectory: string, messagesToSkip: string[]) => {
	const files = readdirSync(currentDirectory);
	for (const file of files) {
		const filePath = `${currentDirectory}/${file}`;
		if (statSync(filePath).isDirectory()) {
			parseOneDirectory(rootFolderPath, allTypes, filePath, messagesToSkip);
		} else if (file.endsWith('.proto')) {
			console.log('PARSE', filePath);
			await parseFile(rootFolderPath, allTypes, filePath, messagesToSkip);
		}
	};
}

export const parseDirectory = async (rootFolderPath: string, messagesToSkip: string[]): Promise<AllTypes> => {
    const allTypes: AllTypes = new Map();

    await parseOneDirectory(rootFolderPath, allTypes, rootFolderPath, messagesToSkip)

    for (const [,t] of allTypes) {
        t.filepath = t.filepath.replace(rootFolderPath.substring(2), "")
    }

    return allTypes
}
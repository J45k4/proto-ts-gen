import { readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { Enum, Namespace, Root, Service, Type, util } from "protobufjs";
import { AllTypes, Field, FlatType } from "./types";

export const getTypes = (
    type: Type | Enum | Namespace, 
    allTypes: Map<string, FlatType>, 
    messagesToSkip: string[]
) => {
    if (!(type instanceof Type) && type instanceof Namespace) {
        for (const subType of type.nestedArray) {
            getTypes(subType as Type, allTypes, messagesToSkip);
        }

        return;
    }

    const fullname = type.fullName.substring(1);

    const parts = fullname.split(".")

    const name = parts.pop()
    const namespace = parts.join("_")

    const filepath = type.filename;


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
            getTypes(subType as Type, allTypes, messagesToSkip);
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

export const parse = (root: Root, allTypes: AllTypes, messagesToSkip: string[]) => {
    for (const nestedItem of root.nestedArray) {
        if (nestedItem instanceof Service) {
            continue;
        }

        getTypes(nestedItem as Type, allTypes, messagesToSkip);
    }
}

export const parseFile = async (allTypes: AllTypes, filePath: string, messagesToSkip: string[]) => new Promise<void>((resolve, reject) => {
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

        parse(root, allTypes, messagesToSkip);

        resolve();
    });
})

const parseOneDirectory = async (allTypes: AllTypes, currentDirectory: string, messagesToSkip: string[]) => {
	const files = readdirSync(currentDirectory);
	for (const file of files) {
		const filePath = `${currentDirectory}/${file}`;
		if (statSync(filePath).isDirectory()) {
			parseOneDirectory(allTypes, filePath, messagesToSkip);
		} else if (file.endsWith('.proto')) {
			console.log('PARSE', filePath);
			await parseFile(allTypes, filePath, messagesToSkip);
		}
	};
}

export const parseDirectory = async (folderPath: string, messagesToSkip: string[]): Promise<AllTypes> => {
    const allTypes: AllTypes = new Map();

    await parseOneDirectory(allTypes, folderPath, messagesToSkip)

    for (const [,t] of allTypes) {
        t.filepath = t.filepath.replace(folderPath.substring(2), "")
    }

    return allTypes
}
import { AllTypes, Field } from "./types";
import { getRelativePath } from "./utility";

export interface Import {
    path: string
    moduleAlias: string
}

export interface InterfaceField {
    name: string
    type: string 
}

export interface Interface {
    name: string
    fields: InterfaceField[] 
}

export interface EnumField {
    name: string
    value: number
}

export interface Enum {
    name: string
    fields: EnumField[]
}

export interface File {
    imports: Map<string, Import>
    interfaces: Map<string, Interface>
    enums: Map<string, Enum>
}

export interface Generation {
    files: Map<string, File>
}

const convertFieldType = (f) => {
    switch (f) {
        case "bool":
            return "boolean";
        case "uint64":
            return "number";
        case "uint32":
            return "number";
        case "int64":
            return "number";
        case "int32":
            return "number";
        case "fixed32":
            return "number";
        case "double":
            return "number";
        case "int":
            return "number";
        case "bytes":
            return "Buffer";
        case "string":
            return "string";
        case "float":
            return "number";
        case "google.protobuf.Any":
            return "any";
        default:
            return f
    } 
}

export const provideFile = (g: Generation, path: string): File => {
    const newPath = path.replace(".proto", ".ts")

    let file = g.files.get(newPath)

    if (!file) {
        file = {
            enums: new Map(),
            imports: new Map(),
            interfaces: new Map()
        }
        g.files.set(newPath, file) 
    }

    return file
}

export const convertToGenerationStructure = (allTypes: AllTypes): Generation  => {
    const generation: Generation = {
        files: new Map()
    }

    for (const [fullname, type] of allTypes) {
        const file = provideFile(generation, type.filepath)

        if (type.isEnum) {
            file.enums.set(type.name, {
                name: type.name,
                fields: type.fields.map(p => {                    
                    return {
                        name: p.name,
                        value: p.value
                    }
                })
            })

            continue
        }

        const interfaceFields: InterfaceField[] = []

        for (const field of type.fields) {
            const fieldType = allTypes.get(field.type)

            let typeName = convertFieldType(field.type)

            if (fieldType) {
                if (fieldType.filepath !== type.filepath) {
                    file.imports.set(fieldType.namespace, {
                        moduleAlias: fieldType.namespace,
                        path: getRelativePath(type.filepath, fieldType.filepath)
                    })

                    typeName = fieldType.namespace + "." + fieldType.name
                }
            }

            if (field.isListType) {
                typeName + "[]"
            }
            
            interfaceFields.push({
                type: typeName,
                name: field.name
            })
        }

        file.interfaces.set(type.name, {
            name: type.name,
            fields: interfaceFields
        })
    }

    return generation
}

// import { Field, TypesContainer } from "./types";

export const printInterfaceField = (args: Field) => {
    if (args.isListType) {
        return `${args.name}${!args.required ? "?" : ""}: ${
            args.type
            }[];`;
    }
    return `${args.name}${!args.required ? "?" : ""}: ${args.type};`;
};

export const printInterface = (args: {
    interfaceName: string;
    interfaceFields: Field[];
}) => {
    return `export interface ${args.interfaceName} {
	${args.interfaceFields.map(p => printInterfaceField(p)).join("\n\t")}
}`;
};

export const printEnumField = (args: Field) => {
    return `${args.name} = ${args.value}`;
};

export const printEnum = (args: {
    enumName: string;
    enumFields: Field[];
}) => {
    return `export enum ${args.enumName} {
	${args.enumFields.map(p => printEnumField(p)).join(",\n\t")}
}`;
};

export const printImport = (args: {
    moduleAlias: string
    path: string
}) => {
    return `import * as ${args.moduleAlias} from "${args.path}"`
}

export const convertFileToText = (f: File) => {
    let output = "";
    
    for (const [,i] of f.imports) {
        output += printImport(i)

        output += "\n\n"
    }

    for (const [,type] of f.enums) {
        output += printEnum({
            enumName: type.name,
            enumFields: type.fields
        })

        output += "\n\n"
    }

    for (const [,i] of f.interfaces) {
        output += printInterface({
            interfaceName: i.name,
            interfaceFields: i.fields
        })

        output += "\n\n"
    }

    return output
}
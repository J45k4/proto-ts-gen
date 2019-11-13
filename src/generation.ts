import { Field, TypesContainer } from "./types";

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


export const generateTypes = (typesContainer: TypesContainer) => {
    let output = "";

    for (const [key, type] of typesContainer.types) {
        if (type.isEnum) {
            output += printEnum({
                enumName: type.name,
                enumFields: type.fields
            }) + "\n";

            continue;
        }

        output += printInterface({
            interfaceName: type.name,
            interfaceFields: type.fields
        }) + "\n";
    }

    return output;
}
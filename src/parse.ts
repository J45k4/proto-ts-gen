import { Enum, Namespace, Root, Service, Type } from "protobufjs";
import { Field, OneType, TypesContainer } from "./types";

export const getTypes = (type: Type | Enum, typesContainer: TypesContainer, messagesToSkip: string[]) => {
    if (!(type instanceof Type) && type instanceof Namespace) {
        for (const subType of type.nestedArray) {
            getTypes(subType as Type, typesContainer, messagesToSkip);
        }

        return;
    }

    if (typesContainer.types.has(type.name)) {
        return;
    }

    const typeDescription: OneType = {
        name: type.name,
        fields: []
    };

    if (type instanceof Type) {
        if (messagesToSkip.includes(type.name)) {
            return;
        }

        for (const subType of type.nestedArray) {
            getTypes(subType as Type, typesContainer, messagesToSkip);
        }

        for (const field of type.fieldsArray) {
            const newField: Field = {
                name: field.name,
                isListType: field.repeated,
                required: field.required,
                type: field.type
            };

            switch (field.type) {
                case "bool":
                    newField.type = "boolean";
                    break;
                case "uint64":
                    newField.type = "number";
                    break;
                case "uint32":
                    newField.type = "number";
                    break;
                case "int64":
                    newField.type = "number";
                    break;
                case "int32":
                    newField.type = "number";
                    break;
                case "fixed32":
                    newField.type = "number";
                    break;
                case "double":
                    newField.type = "number";
                case "int":
                    newField.type = "number";
                    break;
                case "bytes":
                    newField.type = "Buffer";
                    break;
                case "string":
                    newField.type = "string";
                case "float":
                    newField.type = "number";
                    break;
            }

            typeDescription.fields.push(newField);
        }
    }

    if (type instanceof Enum) {
        typeDescription.isEnum = true;

        Object.keys(type.values).forEach(key => {
            const enumKey = key;
            const enumValue = type.values[key];

            const newField: Field = {
                name: key,
                value: enumValue,
                isListType: false,
                required: false,
            };

            typeDescription.fields.push(newField);
        });
    }

    typesContainer.types.set(type.name, typeDescription);
}

export const parse = (root: Root, typesContainer: TypesContainer, messagesToSkip: string[]) => {
    for (const nestedItem of root.nestedArray) {
        if (nestedItem instanceof Service) {
            continue;
        }

        getTypes(nestedItem as Type, typesContainer, messagesToSkip);
    }
}
export type TypesContainer = {
    types: Map<string, OneType>;
}

export type Field = {
    name: string;
    type?: string;
    isListType?: boolean;
    required?: boolean;
    value?: number;
}

export type OneType = {
    name: string;
    isEnum?: boolean;
    fields: Field[];
}
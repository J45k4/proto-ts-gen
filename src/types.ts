
export interface Field {
    name: string
    type?: string
    typeNamespace?: string
    typeFilepath?: string
    isListType?: boolean;
    required?: boolean;
    value?: number;
}


export interface FlatType {
    name: string
    namespace: string
    filepath: string
    isEnum?: boolean
    fields?: Field[]
}

export type AllTypes = Map<string, FlatType>

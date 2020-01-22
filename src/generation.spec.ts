import "source-map-support/register";

import { OneType } from "./types";
import { generateTypes } from "./generation";
import { parseFile } from "./file";

it("generates corrent output", async () => {
    const typesContainer = {
        types: new Map<string, OneType>()
    };

    await parseFile("./test-data/test.proto", typesContainer, []);

    const output = generateTypes(typesContainer);

    expect(output).toBe(`export enum PersonType {
    CUSTOMER = 0,
    OWNER = 1,
    SALES_PERSON = 3
}
export enum Flag {
    First = 0,
    Last = 1
}
export interface Person {
    age?: number;
    name?: string;
    friends?: Person[];
    type?: PersonType;
    flags?: Flag[];
}   
`)
})
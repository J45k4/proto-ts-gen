import "source-map-support/register";

import { convertFileToText, convertToGenerationStructure } from "./generation";
import { parseDirectory } from "./parsing";
import { join } from "path"

it("generates corrent output", async () => {
    const allTypes = await parseDirectory("./test-data", [])

    const generation = convertToGenerationStructure(allTypes)

    const generated = []

    for (const [,f] of generation.files) {
        const o = convertFileToText(f)

        generated.push(o)
    }

    const first =`export interface Home {
\taddress?: string;
}

`

    const second = `import * as bluecow_hyperdrive from "./home"

export enum PersonType {
\tCUSTOMER = 0,
\tOWNER = 1,
\tSALES_PERSON = 3
}

export enum Flag {
\tFirst = 0,
\tLast = 1
}

export interface Date {
\tmilliseconds?: number;
}

export interface Person {
\tage?: number;
\tname?: string;
\tfriends?: Person;
\ttype?: PersonType;
\tflags?: Flag;
\thome?: bluecow_hyperdrive.Home;
}

`

    expect(generated[0]).toBe(first)

    expect(generated[1]).toBe(second)
})

it("Work with absolute path", async () => {
    const allTypes = await parseDirectory(join(__dirname, "../test-data"), [])

    const generation = convertToGenerationStructure(allTypes)

    const generated = []

    for (const [,f] of generation.files) {
        const o = convertFileToText(f)

        generated.push(o)
    }
    
    console.log(generation)
})
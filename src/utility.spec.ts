import "source-map-support/register";

import { getRelativePath } from "./utility"

describe("getRelativePath", () => {
    it("Get relative path when in same directory", () => {
        const your = "./person.proto"
        const destination = "./home.proto"
    
        const p = getRelativePath(your, destination)
    
        expect(p).toBe("./home")
    })
    
    it("Get relative path when in same directory2", () => {
        const your = "./test-data/person.proto"
        const destination = "./test-data/home.proto"
    
        const p = getRelativePath(your, destination)
    
        expect(p).toBe("./home")
    })

    it("Get relative path when destination is in subdirectory", () => {
        const your = "./person.proto"
        const destination = "./test-data/home.proto"
    
        const p = getRelativePath(your, destination)
    
        expect(p).toBe("./test-data/home")
    })

    it ("Get relative path when destination is in parentdirectory", () => {
        const your = "./test-data/person.proto"
        const destination = "./home.proto"
    
        const p = getRelativePath(your, destination)
    
        expect(p).toBe("../home")
    })

    it("Works with more complex path", () => {
        const your = "./test-data/person.proto"
        const destination = "./home.proto"
    
        const p = getRelativePath(your, destination)
    
        expect(p).toBe("../home")
    })

    it("When you are deeper than your destination", () => {
        const your = "./home/room"
        const dst = "./common"

        const p = getRelativePath(your, dst)

        expect(p).toBe("../common")
    })

    it("When you are deeper than your destination2", () => {
        const your = "./root/home/room"
        const dst = "./root/common"

        const p = getRelativePath(your, dst)

        expect(p).toBe("../common")
    })
})
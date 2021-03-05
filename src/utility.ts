
export const getRelativePath = (yourPath: string, destinationPath: string) => {
    const yourSplitted = yourPath.split("/")
    yourSplitted.pop()

    const destinationSplitted = destinationPath.split("/")

    const destinationFilename = destinationSplitted.pop().replace(".proto", "")

    let i = 0

    do {
        i++
    } while (yourSplitted[i] === destinationSplitted[i] && i < yourSplitted.length)

    const yourDif = yourSplitted.length - i
    const destDif = destinationSplitted.length - i

    let y = ""

    if (yourDif < 1) {
        y = "./"
    } else {
        for (let x = 0; x < yourDif; x++) {
            y += "../"
        }
    }

    const s = destinationSplitted.slice(i, destDif + 1)

    const destPath = s.length ? s.join("/") + "/" : ""

    const final = y + destPath + destinationFilename

    return final.replace(`\\`, "/")
}

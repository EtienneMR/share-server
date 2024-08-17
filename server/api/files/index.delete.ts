import type { BlobObject } from "@nuxthub/core"
import { writePath } from "~/utils/abilities"

export default eventHandler(async (event) => {
    const { path, file } = getQuery(event) as { path: string, file?: string }

    await authorize(event, writePath, path)

    const hub = hubBlob()

    const allBlobs: BlobObject[] = []
    let continieFetch = file != "true" // don't fetch is deleting only one file
    let nextCursor = undefined

    while (continieFetch) {
        const { blobs, hasMore, cursor } = await hubBlob().list({ prefix: path + "/", cursor: nextCursor })
        allBlobs.push(...blobs)
        continieFetch = hasMore
        nextCursor = cursor
    }

    await hub.del([path, ...allBlobs.map(blob => blob.pathname)])

    return sendNoContent(event)
})
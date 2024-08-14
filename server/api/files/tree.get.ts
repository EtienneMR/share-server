import type { BlobObject } from "@nuxthub/core"
import { readGlobal } from "~/utils/abilities"

export default eventHandler(async (event) => {
    await authorize(event, readGlobal)

    const allBlobs: BlobObject[] = []
    let continieFetch = true
    let nextCursor = undefined

    while (continieFetch) {
        const { blobs, hasMore, cursor } = await hubBlob().list({ limit: 1000, cursor: nextCursor })
        allBlobs.push(...blobs)
        continieFetch = hasMore
        nextCursor = cursor
    }

    return allBlobs
})

import type { BlobObject } from "@nuxthub/core"

export default eventHandler(async (event) => {
    await requireUserSession(event)

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

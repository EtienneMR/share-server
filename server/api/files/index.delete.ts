import type { BlobObject } from "@nuxthub/core"

export default eventHandler(async (event) => {
    await requireUserSession(event)

    const hub = hubBlob()

    const { path } = getQuery(event) as { path: string }

    const allBlobs: BlobObject[] = []
    let continieFetch = true
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
import type { BlobObject } from "@nuxthub/core"

export default eventHandler(async (event) => {
    await requireUserSession(event)

    const { blobs, folders } = await hubBlob().list({ limit: 1000, folded: true })

    const result: BlobObject[] = [
        ...blobs, ...(folders?.map(folder => ({
            pathname: folder + "",
            contentType: undefined,
            size: 0,
            uploadedAt: new Date(),
        })) ?? [])
    ]

    console.log(result)

    return result
})

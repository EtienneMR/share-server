import type { BlobObject } from "@nuxthub/core"
import { readPath } from "~/utils/abilities"

export type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>
export type PartialBlobObject = PartialExcept<Omit<BlobObject, "uploadedAt">, "pathname">

export default eventHandler(async (event) => {
    let pathname = decodeURI(getRouterParams(event).pathname)
    if (pathname == "%root%") pathname = ""
    else pathname += "/"

    await authorize(event, readPath, event)

    const { blobs, folders } = await hubBlob().list({ limit: 1000, folded: true, prefix: pathname })

    const result: PartialBlobObject[] = [
        ...blobs, ...(folders?.map(folder => ({
            pathname: folder,
        })) ?? [])
    ]

    return result
})

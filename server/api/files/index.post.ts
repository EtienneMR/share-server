import { writePath } from "~/utils/abilities"

export default eventHandler(async (event) => {
    const { public: publicUpload, path: pathQuery } = getQuery(event)
    const path = pathQuery?.toString() ?? ""

    await authorize(event, writePath, path)

    return hubBlob().handleUpload(event, {
        formKey: 'files', // read file or files form the `formKey` field of request body (body should be a `FormData` object)
        multiple: true, // when `true`, the `formKey` field will be an array of `Blob` objects
        ensure: {},
        put: {
            addRandomSuffix: false,
            customMetadata: {
                public: publicUpload?.toString() ?? "false"
            },
            prefix: path,
        },
    })
})

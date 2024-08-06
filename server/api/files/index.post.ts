export default eventHandler(async (event) => {
    await requireUserSession(event)

    const { public: publicUpload, path } = getQuery(event)

    return hubBlob().handleUpload(event, {
        formKey: 'files', // read file or files form the `formKey` field of request body (body should be a `FormData` object)
        multiple: true, // when `true`, the `formKey` field will be an array of `Blob` objects
        ensure: {},
        put: {
            addRandomSuffix: false,
            customMetadata: {
                public: publicUpload?.toString() ?? "false"
            },
            prefix: path?.toString(),
        },
    })
})

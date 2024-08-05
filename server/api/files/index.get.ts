export default eventHandler(async (event) => {
    await requireUserSession(event)

    const { blobs } = await hubBlob().list({ limit: 1000 })

    return blobs
})

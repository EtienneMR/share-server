export default eventHandler(async (event) => {
    await requireUserSession(event)

    const pathnames = await readValidatedBody(event, (data) => Array.isArray(data) && data.every(path => typeof path == "string")) as unknown as string[]

    await hubBlob().del(pathnames)

    return sendNoContent(event)
})
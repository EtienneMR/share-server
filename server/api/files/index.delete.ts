export default eventHandler(async (event) => {
    await requireUserSession(event)

    const pathnames = await readValidatedBody(event, (data) => Array.isArray(data) && data.every(path => typeof path == "string")) as unknown as string[]

    if (import.meta.dev) {
        await hubBlob().del(pathnames)
    } else {
        await Promise.all(pathnames.map(pathname => hubBlob().del(pathname)))
    }

    return sendNoContent(event)
})
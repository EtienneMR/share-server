export default eventHandler(async (event) => {
    await requireUserSession(event)

    const pathnames = await readValidatedBody(event, (data) => Array.isArray(data)) as unknown as string[]

    await hubBlob().del(pathnames)

    return sendNoContent(event)
})
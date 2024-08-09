export default eventHandler(async (event) => {
    await requireUserSession(event)

    const pathnames: string[] = await readBody(event)

    await hubBlob().del(pathnames)

    return sendNoContent(event)
})
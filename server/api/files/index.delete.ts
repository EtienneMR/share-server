export default eventHandler(async (event) => {
    await requireUserSession(event)

    // workaround to prevent cloudflare "The script will never generate a response." error.
    const pathnames = await readRawBody(event)

    await hubBlob().del(JSON.parse(pathnames!))

    return sendNoContent(event)
})
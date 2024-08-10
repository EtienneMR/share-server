export default eventHandler(async (event) => {
    await requireUserSession(event)

    // @ts-expect-error - req.body is not defined in the type definitions
    // workaround to prevent cloudflare "The script will never generate a response." error.
    const pathnames: string = event.node.req.body ?? await readRawBody(event)

    await hubBlob().del(JSON.parse(pathnames))

    return sendNoContent(event)
})
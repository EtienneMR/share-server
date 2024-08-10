export default eventHandler(async (event) => {
    await requireUserSession(event)

    // @ts-expect-error - req.body is not defined in the type definitions
    const pathnames: string = event.node.req.body ?? await readRawBody(event)

    await hubBlob().del(JSON.parse(pathnames))

    return sendNoContent(event)
})
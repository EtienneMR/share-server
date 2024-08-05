export default eventHandler(async (event) => {
    await requireUserSession(event)

    const { pathname } = getRouterParams(event)

    await hubBlob().del(pathname)

    return sendNoContent(event)
})
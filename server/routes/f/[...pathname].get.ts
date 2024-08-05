export default eventHandler(async (event) => {
    const { pathname } = getRouterParams(event)

    if ((await getUserSession(event)).user || (await hubBlob().head(pathname)).customMetadata?.public == "true") {
        return hubBlob().serve(event, pathname)
    }
    else {
        return sendRedirect(event, "/api/auth/central-auth")
    }
})
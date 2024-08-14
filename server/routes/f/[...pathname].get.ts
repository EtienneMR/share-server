import { readPath } from "~/utils/abilities"

export default eventHandler(async (event) => {
    const { pathname } = getRouterParams(event)

    if ((await allows(event, readPath, pathname) || (await hubBlob().head(pathname)).customMetadata?.public == "true")) {
        return hubBlob().serve(event, pathname)
    }
    else {
        return sendRedirect(event, "/")
    }
})
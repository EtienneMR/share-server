export default eventHandler(async (event) => {
    await requireUserSession(event)

    // workaround to prevent cloudflare "The script will never generate a response." error.
    const { path, files } = getQuery(event) as { path: string, files: string }

    console.log(files.split(";").map(file => path + file))

    await hubBlob().del(files.split(";").map(file => path + file))

    return sendNoContent(event)
})
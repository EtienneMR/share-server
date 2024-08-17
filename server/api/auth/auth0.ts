export default oauthAuth0EventHandler({

    config: {
        scope: ["openid", "profile", "email", "read:own-share", "write:own-share", "read:global-share", "write:global-share"],
        audience: "share-server",
    },
    async onSuccess(event, { user, tokens }) {
        await setUserSession(event, {
            user: {
                ...user,
                scope: tokens.scope
            }
        })
        return sendRedirect(event, '/')
    },
})
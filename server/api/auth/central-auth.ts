import type { OAuthConfig } from '#auth-utils'
import { useRuntimeConfig } from '#imports'
import { defu } from 'defu'
import type { H3Event } from 'h3'
import { createError, eventHandler, getQuery, getRequestURL, sendRedirect } from 'h3'
import { withQuery } from 'ufo'

export interface OAuthCentralAuthConfig {
    signinUri: string,
    verifyUri: string,
}

export function oauthCentralAuthEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthCentralAuthConfig>) {
    return eventHandler(async (event: H3Event) => {
        config = defu(config, useRuntimeConfig(event).oauth?.github, {
            signinUri: "https://auth2.etiennemr.fr/signin?serviceId=share-server",
            verifyUri: "https://auth2.etiennemr.fr/api/token/verify?serviceId=share-server&token=",
        }) as OAuthCentralAuthConfig
        const query = getQuery(event)

        if (!query.token) {
            const redirectUrl = getRequestURL(event).href
            return sendRedirect(
                event,
                withQuery(config.signinUri, {
                    redirect: redirectUrl,
                }),
            )
        }

        // TODO: improve typing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user: any = await $fetch(
            config.verifyUri,
            {
                query: { token: query.token }
            },
        )
        if (user.isAuthorized) {
            return onSuccess(event, {
                user,
                tokens: null,
            })
        }
        else {
            const error = createError({
                statusCode: 401,
                message: `central-auth login failed: user not authorized`,
                data: user,
            })
            if (!onError) throw error
            return onError(event, error)
        }
    })
}

export default oauthCentralAuthEventHandler({
    async onSuccess(event, { user }) {
        await setUserSession(event, {
            user
        })
        return sendRedirect(event, '/')
    },
})
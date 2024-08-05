export default defineNuxtRouteMiddleware(() => {
    const { loggedIn } = useUserSession()

    if (!loggedIn.value) {
        return navigateTo('/api/auth/central-auth')
    }
})
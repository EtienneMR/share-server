export const useEncodedPath = () => {
    const route = useRoute()
    const router = useRouter()

    return computed({
        get() {
            return decodeURIComponent(route.path)
        },
        set(value) {
            router.push(encodeURI(value).replaceAll("%2F", "/"))
        }
    })
}
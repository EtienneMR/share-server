export const useTimed = (timeout: number) => {
    const state = ref(false)
    let timeoutId: NodeJS.Timeout

    const stop = () => {
        state.value = false
    }

    const use = () => {
        state.value = true
        clearTimeout(timeoutId)
        timeoutId = setTimeout(stop, timeout)
    }

    return {
        state,
        use
    }
}
export default function formatBytes(bytes: number, decimals: number = 2): string {
    if (!bytes) return "0 Bytes"

    const base = 1000
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(base))

    return `${(bytes / Math.pow(base, i)).toFixed(decimals)} ${sizes[i]}`
}

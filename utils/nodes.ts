import type { BlobObject } from "@nuxthub/core"

export interface TreeNode {
    name: string,
    pathname: string,
    totalSize: number,
    children?: TreeNode[]
    blob?: BlobObject,
    parent?: TreeNode,
}

function incrementNodeTotalSize(node: TreeNode, size: number) {
    node.totalSize += size
    if (node.parent) incrementNodeTotalSize(node.parent, size)
}


export function buildTree(blobs: BlobObject[]): TreeNode {
    const root: TreeNode = { name: 'root', pathname: "/", children: [], totalSize: 0 }

    blobs.forEach(blob => {
        const parts = blob.pathname.split('/')  // Split pathname into parts
        let currentNode = root
        const currentPath = [""]

        parts.forEach((part, index) => {
            currentPath.push(part)

            if (!currentNode.children) {
                currentNode.children = []
            }

            let nextNode = currentNode.children.find(child => child.name == part)

            if (!nextNode) {
                nextNode = { name: part, pathname: currentPath.join("/"), parent: currentNode, totalSize: 0 }
                currentNode.children.push(nextNode)
            }

            currentNode = nextNode

            // If we're at the last part, it means this is the file
            if (index === parts.length - 1) {
                currentNode.blob = blob
                incrementNodeTotalSize(currentNode, blob.size)
            }
        })
    })

    return root
}

function getScore(node: TreeNode) {
    return (node.children ? 2 : 0) + (node.blob ? 1 : 0)
}

export function getNodeFromPath(root: TreeNode, path: string): TreeNode {
    const parts = path.split('/').filter(p => p)
    let currentNode: TreeNode = root

    for (const part of parts) {
        const nextNode = currentNode.children?.find(child => child.name == part)

        if (!nextNode) {
            return { name: "(Vide)", pathname: "", totalSize: 0 }  // Path doesn't exist
        }
        currentNode = nextNode
    }

    currentNode.children?.sort((a, b) => getScore(b) - getScore(a))

    return currentNode
}

export function formatBytes(bytes: number, decimals: number = 2) {
    if (!bytes) return "0 Bytes"

    const base = 1000
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]

    const i = Math.floor(Math.log(bytes) / Math.log(base))

    return `${(bytes / Math.pow(base, i)).toFixed(decimals)} ${sizes[i]}`
}

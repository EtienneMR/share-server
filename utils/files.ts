import type { BlobObject } from "@nuxthub/core"

export interface TreeNode {
    name: string,
    pathname: string,
    children?: TreeNode[]
    blob?: BlobObject
}


export function buildTree(blobs: BlobObject[]): TreeNode {
    const root: TreeNode = { name: 'root', pathname: "/", children: [] }

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
                nextNode = { name: part, pathname: currentPath.join("/") }
                currentNode.children.push(nextNode)
            }

            currentNode = nextNode

            // If we're at the last part, it means this is the file
            if (index === parts.length - 1) {
                currentNode.blob = blob
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
            return { name: "(Vide)", pathname: "" }  // Path doesn't exist
        }
        currentNode = nextNode
    }

    currentNode.children?.sort((a, b) => getScore(b) - getScore(a))

    return currentNode
}

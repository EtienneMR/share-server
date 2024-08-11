import type { BlobObject } from "@nuxthub/core"

export type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>
export type PartialBlobObject = PartialExcept<Omit<BlobObject, "uploadedAt">, "pathname">

export interface TreeNode {
    name: string,
    pathname: string,
    totalSize: number,
    children?: TreeNode[]
    blob?: PartialBlobObject,
    parent?: TreeNode,
}

function incrementNodeTotalSize(node: TreeNode, size: number) {
    node.totalSize += size
    if (node.parent) incrementNodeTotalSize(node.parent, size)
}

export function buildTree(blobs: PartialBlobObject[]): TreeNode {
    const root: TreeNode = { name: 'root', pathname: "/", children: [], totalSize: 0 }

    blobs.forEach(blob => {
        const parts = blob.pathname.split('/')  // Split     pathname into parts
        let currentNode = root
        const currentPath = [""]

        parts.forEach((part, index) => {
            currentPath.push(part)

            let nextNode = currentNode.children?.find(child => child.name == part)

            if (!nextNode) {
                nextNode = { name: part, pathname: currentPath.join("/"), parent: currentNode, totalSize: 0 }
                if (currentNode.children) currentNode.children.push(nextNode)
                else currentNode.children = [nextNode]
            }

            currentNode = nextNode

            // If we're at the last part, it means this is the file
            if (index === parts.length - 1) {
                currentNode.blob = blob
                if (blob.size) incrementNodeTotalSize(currentNode, blob.size)
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

        if (nextNode) {
            currentNode = nextNode
        } else {
            const createdNode = { name: part, pathname: currentNode.pathname + "/" + part, parent: currentNode, totalSize: 0 }
            if (currentNode.children) currentNode.children.push(createdNode)
            else currentNode.children = [createdNode]
        }
    }

    currentNode.children?.sort((a, b) => getScore(b) - getScore(a))

    return currentNode
}
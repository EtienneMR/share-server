export type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>

export interface TreeNode {
    name: string,
    pathname: string,
    totalSize: number,
    children?: TreeNode[]
    blob?: BlobObject,
    parent?: TreeNode,
}
import type { User } from "#auth-utils"

function contructAbility(scope: string) {
    return (user: User) => user.scope.includes(scope)
}



const cReadOwn = contructAbility("read:own-share")
export const readOwn = defineAbility(cReadOwn)

const cWriteOwn = contructAbility("write:own-share")
export const writeOwn = defineAbility(cWriteOwn)


const cReadGlobal = contructAbility("read:global-share")
export const readGlobal = defineAbility(cReadGlobal)

const cWriteGlobal = contructAbility("write:global-share")
export const writeGlobal = defineAbility(cWriteGlobal)


export const readPath = defineAbility((user: User, path: string) => cReadGlobal(user) || (path.startsWith(`/${user.name}/`) && cReadOwn(user)))
export const writePath = defineAbility((user: User, path: string) => cWriteGlobal(user) || (path.startsWith(`/${user.name}/`) && cWriteOwn(user)))
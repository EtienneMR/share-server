// auth.d.ts
declare module '#auth-utils' {
    interface User {
        sub: string,
        nickname: string,
        name: string,
        picture:
        string,
        updated_at: string,
        email: string
        email_verified: boolean,
        scope: string,
    }
}

export { }

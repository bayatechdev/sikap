import { DefaultSession, DefaultUser } from "next-auth"
import { DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      email: string
      name: string
      roles: string[]
      image?: string | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    username: string
    email: string
    name: string
    roles: string[]
    image?: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    username: string
    roles: string[]
  }
}
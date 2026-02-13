import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: DefaultSession['user'] & {
      id: string
      role: string
      status: string
    }
  }

  interface User {
    id: string
    email: string
    name: string
    role: string
    status: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    status: string
  }
}

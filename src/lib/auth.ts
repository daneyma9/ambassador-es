import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        // Validate email domain
        if (!credentials.email.endsWith('@taxdown.es')) {
          throw new Error('Solo se permiten emails de @taxdown.es')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user) {
          throw new Error('Usuario no encontrado')
        }

        // In MVP, we'll store plain passwords for now
        // TODO: Implement proper password hashing with bcrypt
        if (user.email !== credentials.email) {
          throw new Error('Credenciales inválidas')
        }

        if (user.status === 'SUSPENDED') {
          throw new Error('Tu cuenta ha sido suspendida')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.status = (user as any).status
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.status = token.status as string
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

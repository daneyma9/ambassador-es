import { withAuth } from 'next-auth/middleware'

export const middleware = withAuth(
  function middleware(req) {
    // Add custom middleware logic here if needed
    return null
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
  ],
}

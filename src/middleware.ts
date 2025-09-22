import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // This function is called only if user is authenticated
    // Additional checks can be added here if needed
    const token = req.nextauth.token

    // Check if user has required roles for admin pages
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const userRoles = token?.roles as string[] | undefined
      const allowedRoles = ['admin', 'manager', 'reviewer', 'staff']

      if (!userRoles || !userRoles.some(role => allowedRoles.includes(role))) {
        return new Response("Unauthorized", { status: 401 })
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated
        if (req.nextUrl.pathname.startsWith("/dashboard")) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/dashboard/:path*",
    "/api/applications/:path*",
    "/api/documents/:path*"
  ]
}
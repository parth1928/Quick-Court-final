import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/signup", "/forgot-password", "/welcome"]

  // Check if the current path is a public route
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  // Get token from cookie (set by login/register routes)
  const authToken = request.cookies.get("authToken")?.value
  const user = authToken ? JSON.parse(Buffer.from(authToken.split(".")[1], 'base64url').toString()) : null

  // If there's no token, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Handle routing based on user role
  if (user) {
    // Admin routes
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Facility owner routes
    if (pathname.startsWith("/facility") && user.role !== "owner") {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // User routes
    if (pathname.startsWith("/user-home") && user.role !== "user") {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

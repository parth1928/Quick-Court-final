import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public (unauthenticated) pages ONLY; everything else requires auth
  const publicRoutes = ["/", "/login", "/signup", "/welcome", "/forgot-password", "/banned"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const authToken = request.cookies.get('authToken')?.value
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  let user: any = null
  try {
    user = JSON.parse(Buffer.from(authToken.split('.')[1], 'base64url').toString())
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // For banned user checks, we'll handle this in the API routes instead of middleware
  // to avoid Edge Runtime compatibility issues with Mongoose

  // Explicit role route maps (exact or prefix checks)
  const adminOnly: ((p:string)=>boolean)[] = [
    p => p === '/admin-dashboard',
    p => p === '/facility-approval',
    p => p === '/venue-approval',
    p => p === '/user-management',
    p => p === '/reports',
  ]
  const ownerOnly: ((p:string)=>boolean)[] = [
    p => p === '/facility-dashboard',
    p => p === '/facility-management',
    p => p === '/court-management',
    p => p === '/time-slot-management',
    p => p === '/booking-overview',
    p => p === '/tournament-hosting',
    p => p === '/my-facilities',
  ]
  const userOnly: ((p:string)=>boolean)[] = [
    p => p === '/user-home',
    p => p === '/my-bookings',
    p => p === '/my-tournaments',
  ]

  const isAdminRoute = adminOnly.some(fn => fn(pathname))
  const isOwnerRoute = ownerOnly.some(fn => fn(pathname))
  const isUserRoute = userOnly.some(fn => fn(pathname))

  if (isAdminRoute && user.role !== 'admin') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isOwnerRoute && user.role !== 'owner') {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  if (isUserRoute && user.role !== 'user') {
    return NextResponse.redirect(new URL('/login', request.url))
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

import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and API routes
  if (
    req.nextUrl.pathname.startsWith("/_next") ||
    req.nextUrl.pathname.startsWith("/api") ||
    req.nextUrl.pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session

  // Define routes
  const isAuthRoute = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register"
  const isRootRoute = req.nextUrl.pathname === "/"
  const isAuthCallback = req.nextUrl.pathname.startsWith("/auth/callback")
  const isDebugRoute = req.nextUrl.pathname === "/debug"

  // Always allow debug and auth callback routes
  if (isAuthCallback || isDebugRoute) {
    return res
  }

  // If user is authenticated and trying to access auth routes, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && !isAuthRoute && !isRootRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

// Only apply middleware to specific paths
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

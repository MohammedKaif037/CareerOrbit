import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  // Don't run middleware on static files or API routes
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
  const isAuthRoute = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/register"
  const isRootRoute = req.nextUrl.pathname === "/"
  const isAuthCallback = req.nextUrl.pathname.startsWith("/auth/callback")

  // Allow auth callback to proceed without redirection
  if (isAuthCallback) {
    return res
  }

  // If the user is on an auth route but is already authenticated, redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If the user is accessing protected routes but is not authenticated, redirect to login
  if (!isAuthenticated && !isAuthRoute && !isRootRoute) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return res
}

// Specify the paths that should be protected by the middleware
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

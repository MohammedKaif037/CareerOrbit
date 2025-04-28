import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const { pathname } = req.nextUrl;
  const isRedirected = req.nextUrl.searchParams.has("redirected");

  const { data: { session } } = await supabase.auth.getSession();

  // Allow public routes
  if (pathname.startsWith("/auth/")) return res;
  if (isRedirected) return res;

  const protectedPaths = ["/dashboard", "/applications", "/applications/new"];
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (!session && isProtected) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (session && (pathname.startsWith("/login") || pathname.startsWith("/register"))) {
    return NextResponse.redirect(new URL("/dashboard?redirected=true", req.url));
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/dashboard/:path*",
    "/applications/:path*",
    "/your-applications/:path*", 
    "/login",
    "/register",
    "/auth/:path*",
  ],
};

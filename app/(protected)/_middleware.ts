// File: app/(protected)/_middleware.ts - Implement proper middleware
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no session, redirect to login
  if (!session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    // Store the original URL without the /protected prefix
    const originalPath = request.nextUrl.pathname.replace(/^\/protected/, '');
    redirectUrl.searchParams.set('redirect', originalPath);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Match all routes that should be protected
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/applications/:path*',
    '/your-applications/:path*',
    '/interviews/:path*'
  ],
};

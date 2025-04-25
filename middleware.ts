// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition
  const isLoggedIn = !!session;
  const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                     req.nextUrl.pathname.startsWith('/register');
  
  // If accessing auth pages while logged in, redirect to dashboard
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
  
  // If accessing protected pages while logged out, redirect to login
  if (!isLoggedIn && !isAuthPage && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/login', req.url));
  }
  
  return res;
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    '/',
    '/dashboard',
    '/applications/:path*',
    '/interviews/:path*',
    '/analytics',
    '/your-applications/:path*',
    '/login',
    '/register',
  ],
};

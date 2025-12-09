import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { auth } from './auth';

export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const isPublicPath =
    path.startsWith('/auth/sign-in') ||
    path.startsWith('/auth/sign-up') ||
    path.startsWith('/auth/forgot-password') ||
    path.startsWith('/api/auth') ||
    path.startsWith('/error/not-found') ||
    path.startsWith('/_next') ||
    path === '/favicon.ico';

  if (isPublicPath) {
    return NextResponse.next();
  }

  const session = await auth();

  // If there's no session and the path isn't public, redirect to sign-in
  if (!session?.accessToken) {
    const signInUrl = new URL('/auth/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

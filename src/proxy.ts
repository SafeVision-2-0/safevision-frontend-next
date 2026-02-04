// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode payload (2nd part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    const payload = JSON.parse(jsonPayload);

    if (!payload.exp) return true;

    // Check if current time (in seconds) is past the expiration
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= payload.exp;
  } catch (e) {
    return true; // Treat malformed tokens as expired
  }
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Determine if token is actually valid
  const isValid = token && !isTokenExpired(token);

  // Paths accessible without authentication
  if (pathname === '/login') {
    // If user is already logged in with a valid token, redirect to home
    if (isValid) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isValid) {
    const loginUrl = new URL('/login', request.url);
    // Optional: preserve the URL the user was trying to access
    loginUrl.searchParams.set('from', pathname);

    const response = NextResponse.redirect(loginUrl);

    // If the token existed but was invalid/expired, clear it
    if (token) {
      response.cookies.delete('token');
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - assets (public assets)
   */
  matcher: ['/((?!api|_next/static|assets|_next/image|favicon.ico).*)'],
};

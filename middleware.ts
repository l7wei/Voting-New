import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/', '/login', '/api/auth/login', '/api/auth/callback', '/api/mock', '/api/activities'];
  
  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => {
    if (path === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(path);
  });
  
  // API routes and public paths are allowed
  if (isPublicPath || pathname.startsWith('/_next') || pathname.startsWith('/static')) {
    return NextResponse.next();
  }
  
  // Check for authentication token
  const token = request.cookies.get('service_token')?.value;
  
  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

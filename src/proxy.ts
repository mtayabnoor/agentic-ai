import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export default async function proxy(request: NextRequest) {
  let session = null;

  try {
    session = await auth.api.getSession({
      headers: request.headers,
    });
  } catch (error) {
    session = null;
  }

  const isLoggedIn = !!session?.user;

  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard');
  const isProtectedRoute = isDashboardRoute;
  const isAuthRoute = ['/signin', '/signup', '/verify-email'].some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );

  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  if (isLoggedIn && isProtectedRoute && session?.user && !session.user.emailVerified) {
    const verifyUrl = new URL('/verify-email', request.url);
    verifyUrl.searchParams.set('email', session.user.email);
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/tools/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|robots.txt|sitemap.xml).*)',
  ],
};

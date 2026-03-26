import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  // Better Auth uses "better-auth.session_token" cookie by default (or __Secure- prefix on Vercel)
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const isLoggedIn = !!session?.user;

  const isDashboardRoute =
    request.nextUrl.pathname.startsWith("/dashboard")

  if (!isLoggedIn && isDashboardRoute) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isLoggedIn && isDashboardRoute && !session.user.emailVerified) {
    const verifyUrl = new URL("/verify-email", request.url);
    verifyUrl.searchParams.set("mode", "pending");
    verifyUrl.searchParams.set("email", session.user.email);
    return NextResponse.redirect(verifyUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|robots.txt|sitemap.xml).*)",
  ],
};

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const AUTH_ROUTES = ["signin", "signup"];

export default async function Middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.includes(route));
  const sessionCookie = getSessionCookie(request);

  if (!sessionCookie) {
    return isAuthRoute
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/signin", request.url));
  }

  if (isAuthRoute) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/signin", "/signup", "/app/:path*"],
};

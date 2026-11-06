import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const isLoginPage = pathname.startsWith("/login");
  const isAuthApi = pathname.startsWith("/api/auth");
  const isPublicCheckIn =
    pathname === "/check-in" || pathname.startsWith("/api/check-in");

  const isPublicAsset =
    pathname.startsWith("/logos") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.[a-zA-Z0-9]+$/.test(pathname);

  if (isAuthApi || isPublicAsset || isPublicCheckIn) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isLoginPage) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};

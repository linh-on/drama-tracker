import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });

  const isLoggedIn = !!token;
  const path = req.nextUrl.pathname;

  const isPublicPath =
    path === "/login" ||
    path === "/register" ||
    path === "/verify" ||
    path.startsWith("/api/auth");

  if (isPublicPath) return NextResponse.next();

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (isLoggedIn && path === "/login") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicRoute = pathname === "/";
  const isNextInternal = pathname.startsWith("/_next");
  const isApiRoute = pathname.startsWith("/api");
  const isFileRequest = /\.[^/]+$/.test(pathname);

  if (isPublicRoute || isNextInternal || isApiRoute || isFileRequest) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  if (!accessToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"]
};

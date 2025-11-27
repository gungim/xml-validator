import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // If user is authenticated and tries to access login or root, redirect to workspaces
  if (session && (pathname === "/login" || pathname === "/")) {
    return NextResponse.redirect(new URL("/workspaces", request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (!session && pathname.startsWith("/workspaces")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/workspaces/:path*"],
};

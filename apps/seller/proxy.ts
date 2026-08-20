import { NextRequest, NextResponse } from "next/server";

function centralLoginUrl() {
  const centralOrigin = process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL
    || (process.env.VERCEL ? "https://bandhan-user.vercel.app" : "http://localhost:3000");
  return new URL("/login", centralOrigin);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(centralLoginUrl());
  }
  return NextResponse.next();
}

export const config = { matcher: ["/login"] };

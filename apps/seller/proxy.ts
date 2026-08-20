import { NextRequest, NextResponse } from "next/server";

function centralAuthUrl(path: string) {
  const centralOrigin = process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL
    || (process.env.VERCEL ? "https://bandhan-user.vercel.app" : "http://localhost:3000");
  return new URL(path, centralOrigin);
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(centralAuthUrl("/login"));
  }
  if (request.nextUrl.pathname === "/signup") {
    return NextResponse.redirect(centralAuthUrl("/signup/seller"));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/login", "/signup"] };

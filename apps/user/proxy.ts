import { NextRequest, NextResponse } from "next/server";
import { isPrivateRoute } from "./lib/privateRoutes";

export function proxy(request: NextRequest) {
  if (!isPrivateRoute(request.nextUrl.pathname)) return NextResponse.next();
  if (request.cookies.get("bandhan_user_token")?.value) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

// Account routes now live at the root, so the matcher covers app pages and the
// proxy decides which of them are private via the shared route list.
export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};

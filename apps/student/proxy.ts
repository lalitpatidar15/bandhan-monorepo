import { NextRequest, NextResponse } from "next/server";

const studentPublicRoutes = new Set(["/student", "/student/auth", "/student/login", "/student/courses"]);
const instructorPublicRoutes = new Set(["/instructor", "/instructor/login"]);

function centralAuthUrl(path: string) {
  const centralOrigin = process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL
    || (process.env.VERCEL ? "https://bandhan-user.vercel.app" : "http://localhost:3000");
  return new URL(path, centralOrigin);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (["/student/auth", "/student/login", "/instructor/login"].includes(pathname)) {
    return NextResponse.redirect(centralAuthUrl("/login"));
  }
  if (pathname === "/signup") {
    return NextResponse.redirect(centralAuthUrl("/signup/student"));
  }
  let role: "student" | "instructor" | null = null;

  const publicCourseDetails = pathname.startsWith("/student/view_details/");
  if (pathname.startsWith("/student/") && !studentPublicRoutes.has(pathname) && !publicCourseDetails) role = "student";
  else if (pathname.startsWith("/instructor/") && !instructorPublicRoutes.has(pathname)) role = "instructor";
  else if (["/course-player", "/live-session", "/my-courses"].some((path) => pathname === path || pathname.startsWith(`${path}/`))) role = "student";

  if (!role) return NextResponse.next();

  const token = request.cookies.get("bandhan_academy_token")?.value;
  const sessionRole = request.cookies.get("bandhan_academy_role")?.value;
  if (token && sessionRole === role) return NextResponse.next();

  const loginPath = role === "instructor" ? "/instructor/login" : "/student/auth";
  const loginUrl = new URL(loginPath, request.url);
  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/signup", "/student/:path*", "/instructor/:path*", "/course-player/:path*", "/live-session/:path*", "/my-courses/:path*"],
};

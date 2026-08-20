import { NextRequest, NextResponse } from "next/server";

const publicPaths = new Set(["/", "/Jobseeker", "/Jobseeker/login", "/Jobseeker/signup", "/jobposter", "/jobposter/login", "/jobposter/register", "/jobposter/forgot-password", "/jobposter/privacy-policy", "/jobposter/terms-of-service", "/jobposter/cookie-policy", "/jobposter/contact-support"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const normalized = pathname.replace(/\/$/, "") || "/";

  if (request.nextUrl.searchParams.has("_rsc")) return NextResponse.next();
  if (publicPaths.has(normalized)) return NextResponse.next();

  const isJobseekerRoute = normalized.startsWith("/Jobseeker/");
  const isRecruiterRoute = normalized.startsWith("/jobposter/");
  if (!isJobseekerRoute && !isRecruiterRoute) return NextResponse.next();

  const token = request.cookies.get("bandhan_job_token")?.value;
  if (!token) {
    const loginUrl = new URL(isRecruiterRoute ? "/jobposter/login" : "/Jobseeker/login", request.url);
    loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/Jobseeker/:path*", "/jobposter/:path*"],
};

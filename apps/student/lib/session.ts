export type AcademyRole = "student" | "instructor";

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

export function setAcademySession(token: string, role: AcademyRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `bandhan_academy_token=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
  document.cookie = `bandhan_academy_role=${role}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function clearAcademySession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("studentId");
  localStorage.removeItem("instructor");
  document.cookie = "bandhan_academy_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "bandhan_academy_role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function centralLoginUrl() {
  return process.env.NEXT_PUBLIC_CENTRAL_LOGIN_URL || (process.env.NODE_ENV === "production" ? "https://bandhan-user.vercel.app/login" : "http://localhost:3000/login");
}

export function readTokenRole(token: string): AcademyRole | null {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload.role === "student" || payload.role === "instructor" ? payload.role : null;
  } catch {
    return null;
  }
}

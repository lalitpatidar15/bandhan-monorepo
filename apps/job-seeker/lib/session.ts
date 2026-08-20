export type JobPortalRole = "jobseeker" | "recruiter";

export function setJobPortalSession(token: string, role: JobPortalRole) {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  localStorage.setItem("role", role);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `bandhan_job_token=${encodeURIComponent(token)}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
  document.cookie = `bandhan_job_role=${role}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

export function clearJobPortalSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  document.cookie = "bandhan_job_token=; Path=/; Max-Age=0; SameSite=Lax";
  document.cookie = "bandhan_job_role=; Path=/; Max-Age=0; SameSite=Lax";
}

export function readTokenRole(token: string): JobPortalRole | null {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, "=")));
    if (payload.exp && payload.exp * 1000 <= Date.now()) return null;
    return payload.role === "jobseeker" || payload.role === "recruiter" ? payload.role : null;
  } catch {
    return null;
  }
}

import { redirect } from "next/navigation";

// Legacy URL kept only so existing bookmarks resolve to the live dashboard.
export default function OverviewRedirectPage() {
  redirect("/userdashboard/dashboard");
}

import { redirect } from "next/navigation";

// Single public authentication entry point. Existing /login and /signup URLs
// remain valid for backwards compatibility.
export default function CentralAuthPage() {
  redirect("/login");
}

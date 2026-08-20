import { redirect } from "next/navigation";

export default function ServiceListingPage() {
  redirect("/listings/service");
  return null;
}

import { redirect } from "next/navigation";

export default function VendorsAliasPage() {
  redirect("/explore?type=services");
}

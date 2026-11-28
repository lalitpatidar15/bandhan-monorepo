import { redirect } from "next/navigation";
import { centralLoginUrl } from "@/lib/session";

export default function Home() {
  redirect(centralLoginUrl());
}

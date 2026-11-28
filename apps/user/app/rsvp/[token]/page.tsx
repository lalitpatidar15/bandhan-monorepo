import type { Metadata } from "next";
import RsvpClient from "@/components/rsvp/RsvpClient";

export const metadata: Metadata = {
  title: "RSVP | Bandhan",
  description: "Confirm your attendance for a Bandhan event.",
};

export default async function RsvpPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <RsvpClient token={token} />;
}

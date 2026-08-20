import { redirect } from "next/navigation";

export default async function VenueLegacyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/explore?type=venues/${id}`);
}

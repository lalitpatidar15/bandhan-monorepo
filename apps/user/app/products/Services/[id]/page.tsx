import { redirect } from "next/navigation";

export default async function ServiceLegacyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/explore?type=services/${id}`);
}

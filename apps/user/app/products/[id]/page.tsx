import { redirect } from "next/navigation";

export default async function ProductLegacyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/listings/product/${encodeURIComponent(String(id))}`);
}

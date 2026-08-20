import { notFound, redirect } from "next/navigation";
import PublicCatalogueDetail from "@/components/catalog/PublicCatalogueDetail";
import type { PublicDiscoveryKind } from "@/components/catalog/PublicCataloguePage";

const exploreTypeByListingType: Record<string, string> = {
  product: "products",
  service: "services",
  venue: "venues",
};

const publicDiscoveryKindByListingType: Record<string, PublicDiscoveryKind> = {
  course: "courses",
  courses: "courses",
  job: "jobs",
  jobs: "jobs",
  rental: "rentals",
  rentals: "rentals",
};

export default async function ListingDetailPage({ params }: { params: Promise<{ type: string; id: string }> }) {
  const { type, id } = await params;
  const publicDiscoveryKind = publicDiscoveryKindByListingType[type];
  if (publicDiscoveryKind && id) {
    return <PublicCatalogueDetail kind={publicDiscoveryKind} id={id} />;
  }

  const exploreType = exploreTypeByListingType[type];
  if (!exploreType || !id) notFound();

  redirect(`/explore?type=${exploreType}/${encodeURIComponent(id)}`);
}

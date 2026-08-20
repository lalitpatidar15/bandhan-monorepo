import { notFound, redirect } from "next/navigation";

const exploreTypeByListingType: Record<string, string> = {
  product: "products",
  service: "services",
  venue: "venues",
};

const publicCataloguePathByListingType: Record<string, string> = {
  course: "/courses",
  courses: "/courses",
  job: "/jobs",
  jobs: "/jobs",
  rental: "/rentals",
  rentals: "/rentals",
};

export default async function ListingPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const publicCataloguePath = publicCataloguePathByListingType[type];
  if (publicCataloguePath) redirect(publicCataloguePath);

  const exploreType = exploreTypeByListingType[type];
  if (!exploreType) notFound();

  redirect(`/explore?type=${exploreType}`);
}

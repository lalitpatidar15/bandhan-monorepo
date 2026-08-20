import PublicCataloguePage from "@/components/catalog/PublicCataloguePage";

export const metadata = {
  title: "Jobs | Bandhan",
  description: "Browse active opportunities from Bandhan employers before applying in the careers portal.",
};

export default function JobsPage() {
  return <PublicCataloguePage kind="jobs" />;
}

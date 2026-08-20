import PublicCataloguePage from "@/components/catalog/PublicCataloguePage";

export const metadata = {
  title: "Rentals | Bandhan",
  description: "Browse approved event rental products on Bandhan.",
};

export default function RentalsPage() {
  return <PublicCataloguePage kind="rentals" />;
}

import PublicCataloguePage from "@/components/catalog/PublicCataloguePage";

export const metadata = {
  title: "Courses | Bandhan",
  description: "Browse published Bandhan courses before enrolling in the learning portal.",
};

export default function CoursesPage() {
  return <PublicCataloguePage kind="courses" />;
}

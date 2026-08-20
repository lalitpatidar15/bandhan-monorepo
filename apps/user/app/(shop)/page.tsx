import HeroCarousel from "@/components/home/HeroCarousel";
import TrustBar from "@/components/home/TrustBar";
import CategoryGrid from "@/components/home/CategoryGrid";
import TrendingProducts from "@/components/home/TrendingProducts";
import PromoCollections from "@/components/home/PromoCollections";
import PromoStrip from "@/components/home/PromoStrip";
import FeaturedServices from "@/components/home/FeaturedServices";
import FeaturedVenues from "@/components/home/FeaturedVenues";
import ReviewsSection from "@/components/home/ReviewsSection";
import Newsletter from "@/components/home/Newsletter";
import { JourneyPanel } from "@bandhan/ui";

export const metadata = {
  title: "Bandhan — The celebration ecosystem",
  description:
    "Discover venues, services and products for a celebration. Build your career with jobs and expert-led courses. Every next step begins at Bandhan.",
};

export default function RootPage() {
  return (
    <>
      <HeroCarousel />
      <div className="bhn-container bhn-home-journey-wrap">
        <JourneyPanel
          eyebrow="How Bandhan helps"
          title="Plan your event one simple step at a time"
          description="Tell us what you are celebrating and we will guide you through budget, venue, services and products."
          completed={0}
          total={4}
          nextLabel="Choose your event type, date and city"
          nextHref="/userdashboard/planner"
          actionLabel="Start planning"
          help={<a href="/contact">Need help? Talk to Bandhan support</a>}
        />
      </div>
      <TrustBar />
      <CategoryGrid />
      <TrendingProducts />
      <PromoCollections />
      <PromoStrip />
      <FeaturedServices />
      <FeaturedVenues />
      <ReviewsSection />
      <Newsletter />
    </>
  );
}

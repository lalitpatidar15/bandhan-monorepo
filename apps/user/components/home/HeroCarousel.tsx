import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Search, Sparkles } from "lucide-react";

const discoveryLinks = [
  { label: "Products", href: "/explore?type=products" },
  { label: "Services", href: "/explore?type=services" },
  { label: "Venues", href: "/explore?type=venues" },
  { label: "Rentals", href: "/rentals" },
];

export default function HeroCarousel() {
  return (
    <section className="bhn-home-hero" aria-labelledby="home-heading">
      <Image
        src="/venue.png"
        alt="An elegant Indian celebration venue"
        fill
        priority
        sizes="100vw"
        className="bhn-home-hero-image"
      />
      <div className="bhn-home-hero-shade" aria-hidden="true" />
      <div className="bhn-home-hero-inner">
        <div className="bhn-home-hero-copy">
          <p className="bhn-home-kicker"><Sparkles size={14} aria-hidden="true" /> Weddings, events and beyond</p>
          <h1 id="home-heading">Everything for your celebration, <em>all in one place.</em></h1>
          <p className="bhn-home-lead">
            Compare products, trusted services and memorable venues—then keep every booking and plan together.
          </p>
          <div className="bhn-home-actions">
            <Link className="bhn-home-primary" href="/explore?type=products">
              <Search size={18} aria-hidden="true" /> Explore marketplace <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link className="bhn-home-secondary" href="/userdashboard/planner">
              <CalendarDays size={18} aria-hidden="true" /> Plan an event
            </Link>
          </div>
          <nav className="bhn-home-discovery" aria-label="Explore Bandhan">
            <span>Popular:</span>
            {discoveryLinks.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}
          </nav>
        </div>
      </div>
    </section>
  );
}

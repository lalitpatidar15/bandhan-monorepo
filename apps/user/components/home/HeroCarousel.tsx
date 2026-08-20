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
      <div className="bhn-home-hero-copy">
        <p className="bhn-home-kicker"><Sparkles size={14} aria-hidden="true" /> The Bandhan ecosystem</p>
        <h1 id="home-heading">Your celebration.<br /><em>One clear next step.</em></h1>
        <p className="bhn-home-lead">
          Find trusted products, services and venues, plan every detail, or build your next opportunity—all in one welcoming place.
        </p>
        <div className="bhn-home-actions">
          <Link className="bhn-home-primary" href="/explore">
            <Search size={18} aria-hidden="true" /> Start exploring <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link className="bhn-home-secondary" href="/userdashboard/planner">
            <CalendarDays size={18} aria-hidden="true" /> Plan an event
          </Link>
        </div>
        <nav className="bhn-home-discovery" aria-label="Explore Bandhan">
          <span>Explore:</span>
          {discoveryLinks.map((item) => <Link key={item.label} href={item.href}>{item.label}</Link>)}
        </nav>
      </div>
      <div className="bhn-home-collage" aria-label="Celebrations brought together">
        <figure className="bhn-home-photo bhn-home-photo-small">
          <Image src="/photoshot.png" alt="Wedding celebration photography" fill priority sizes="(max-width: 900px) 45vw, 220px" />
        </figure>
        <figure className="bhn-home-photo bhn-home-photo-main">
          <Image src="/venue4.png" alt="A decorated celebration venue" fill priority sizes="(max-width: 900px) 55vw, 360px" />
          <figcaption>Celebrations, thoughtfully brought together</figcaption>
        </figure>
        <figure className="bhn-home-photo bhn-home-photo-small">
          <Image src="/makeup.png" alt="Wedding preparation service" fill sizes="(max-width: 900px) 45vw, 220px" />
        </figure>
      </div>
    </section>
  );
}

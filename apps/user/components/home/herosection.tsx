import { ArrowRight, PlayCircle } from "lucide-react";
import Image from "next/image";

export const Herosection = () => {
  return (
    <section id="home" className="scroll-mt-24 overflow-hidden px-4 pb-10 pt-10 sm:px-6 md:pb-16 md:pt-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
        <div className="bhn-hero">
          <div className="bhn-hero-body max-w-none">
            <p className="bhn-chip text-xs font-semibold uppercase tracking-[.16em] text-[var(--bhn-brand-700)]">The Bandhan ecosystem</p>
            <h1 className="bhn-hero-title mt-5">One beautiful place to <em className="not-italic text-[var(--bhn-brand-200)]">celebrate, grow</em> and build.</h1>
            <p className="bhn-hero-desc">Discover venues, services and products for a celebration. Build your career with jobs and expert-led courses. Every next step begins at Bandhan.</p>
            <div className="bhn-hero-actions">
              <a href="#catalog/venues" className="bhn-btn bhn-btn-primary bhn-btn-lg">Explore experiences <ArrowRight size={17} /></a>
              <a href="#portals" className="bhn-btn bhn-btn-secondary bhn-btn-lg"><PlayCircle size={18} /> Meet the portals</a>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 border-t border-[color:rgba(255,255,255,0.2)] pt-5 text-sm"><div><strong className="block text-2xl text-[var(--bhn-text-on-brand)]" style={{ fontFamily: "var(--bhn-font-display)" }}>5</strong><span className="text-[var(--bhn-text-on-brand)] opacity-75">connected portals</span></div><div><strong className="block text-2xl text-[var(--bhn-text-on-brand)]" style={{ fontFamily: "var(--bhn-font-display)" }}>1</strong><span className="text-[var(--bhn-text-on-brand)] opacity-75">trusted ecosystem</span></div><div><strong className="block text-2xl text-[var(--bhn-text-on-brand)]" style={{ fontFamily: "var(--bhn-font-display)" }}>∞</strong><span className="text-[var(--bhn-text-on-brand)] opacity-75">possibilities</span></div></div>
          </div>
        </div>
        <div className="grid grid-cols-2 items-end gap-3 lg:pl-6">
        <div className="h-[64px] overflow-hidden ring-1 ring-[var(--bhn-border)] bg-[var(--bhn-surface)] sm:w-20 sm:h-14 md:w-36 md:h-24">
          <Image src="/image1.png" alt="Event detail" width={400} height={300} className="w-full h-full object-cover" />
        </div>

        <div className="h-[110px] overflow-hidden rounded-tl-[40px] ring-1 ring-[var(--bhn-border)] bg-[var(--bhn-surface)] sm:w-20 md:w-32 md:h-48 md:rounded-tl-[60px]">
          <Image src="/image2.png" alt="Event decor" width={400} height={500} className="w-full h-full object-cover" />
        </div>

        <div className="col-span-2 h-[160px] overflow-hidden rounded-t-[50px] ring-1 ring-[var(--bhn-border)] bg-[var(--bhn-surface)] sm:col-span-1 sm:w-28 sm:h-[150px] md:w-[200px] md:h-[260px] md:rounded-t-[80px]">
          <Image src="/image3.png" alt="Event setup" width={500} height={650} className="w-full h-full object-cover" />
        </div>

        <div className="h-[110px] overflow-hidden rounded-tr-[40px] ring-1 ring-[var(--bhn-border)] bg-[var(--bhn-surface)] sm:w-[80px] md:w-[130px] md:h-[192px] md:rounded-tr-[60px]">
          <Image
            src="/image4.png"
            alt="Celebration setup"
            width={400}
            height={500}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="h-[64px] overflow-hidden ring-1 ring-[var(--bhn-border)] bg-[var(--bhn-surface)] sm:w-[90px] sm:h-14 md:w-[146px] md:h-[96px]">
          <Image src="/image5.png" alt="Event venue" width={400} height={300} className="w-full h-full object-cover" />
        </div>
        </div>
      </div>
    </section>
  );
};

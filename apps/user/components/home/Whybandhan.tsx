import { CheckCircle, Smile, Link2, Sun } from "lucide-react";
import Link from "next/link";

export default function WhyBandhan() {
  const features = [
    {
      title: "Curated Vendors",
      desc: "Work with handpicked professionals who are known for quality events.",
      icon: <CheckCircle size={22} />,
      className: "lg:mt-14",
    },
    {
      title: "Stress-Free Experience",
      desc: "Focus on celebrating your special moments while we handle the details behind the scenes.",
      icon: <Smile size={22} />,
      className: "",
    },
    {
      title: "Seamless Planning",
      desc: "Manage budgets, timelines, and bookings in one place—designed to simplify journey.",
      icon: <Link2 size={22} />,
      className: "lg:-mt-12",
    },
    {
      title: "Trusted Experts",
      desc: "Partner with experienced planners and vendors who understand your vision.",
      icon: <Sun size={22} />,
      className: "lg:-mt-20",
    },
  ];

  const steps = [
    {
      no: "01",
      title: "Discover",
      desc: "Browse thousands of verified vendors and filter by style, budget, and location.",
    },
    {
      no: "02",
      title: "Quotation",
      desc: "Receive personalized quotes directly from the experts with platform-exclusive rates.",
    },
    {
      no: "03",
      title: "Book",
      desc: "Secure your date with ease through our protected payment gateway and contract system.",
    },
  ];

  return (
    <>
      {/* ================= WHY BANDHAN ================= */}
      <section className="w-full bg-[var(--bhn-surface-2)] py-24 px-6 lg:px-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          {/* LEFT */}
          <div>
            <p className="text-sm text-[var(--bhn-text-muted)] mb-4">Why Bandhan?</p>

            <h2 className="text-xl lg:text-6xl font-serif leading-tight mb-6 text-[var(--bhn-text)]">
              The <span className="text-[var(--bhn-brand-700)]">Bandhan</span>
              <br />
              Difference
            </h2>

            <p className="text-[var(--bhn-text-muted)] max-w-xl mb-4">
              For every couple, a event is more than an event— it’s a
              once-in-a-lifetime story. At Bandhan, we bring together trusted
              vendors.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 text-[var(--bhn-brand-700)] font-medium text-[10px] sm:text-[18px] md:text-[18px] leading-[24px]">
              <Link
                href="/userdashboard/plans"
                className="no-underline border-b border-transparent pb-1 hover:border-[var(--bhn-brand-600)] transition"
              >
                Plan Your Event →
              </Link>

              <Link
                href="/products/service-listing"
                className="no-underline border-b border-transparent pb-1 hover:border-[var(--bhn-brand-600)] transition"
              >
                Explore Vendors →
              </Link>
            </div>
          </div>

          {/* RIGHT STAGGER CARDS */}
          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((item, i) => (
              <div key={i} className={item.className}>
                <div className="bhn-card bhn-card-hover p-4">
                  <div className="flex items-start gap-3">
                    <div className="bhn-icon-tile text-[var(--bhn-brand-700)] text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <h6 className="font-semibold text-[13px] text-[var(--bhn-text)] mb-1">{item.title}</h6>
                      <p className="text-[var(--bhn-text-muted)] text-[12px] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bhn-bg)] py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-xl font-serif text-[var(--bhn-brand-600)] mb-20">
            The Journey to Your Dream Event
          </h2>

          {/* line */}
          <div className="hidden md:block  w-full relative top-20"></div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-[100px] h-[100px] rounded-full bg-[var(--bhn-surface)] border border-[var(--bhn-border)] shadow-[var(--bhn-shadow-md)] flex items-center justify-center font-hedvig text-[50px] leading-[69px] font-normal text-[var(--bhn-brand-600)] mb-6">
                  {step.no}
                </div>

                <h3 className="text-[var(--bhn-brand-700)] font-semibold text-lg mb-2">
                  {step.title}
                </h3>

                <p className="text-[var(--bhn-text-muted)] max-w-xs text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

import { useState } from "react";
import Image from "next/image";
import { CalendarCheck, ChevronDown, MapPin, ShieldCheck, Sparkles, Star } from "lucide-react";

const openContact = () => {
  window.dispatchEvent(new Event("bandhan:open-contact"));
};

const eventTypes = [
  {
    title: "Weddings",
    description: "From intimate ceremonies to multi-day celebrations, planned around your story.",
    image: "/royal.png",
  },
  {
    title: "Corporate Events",
    description: "Conferences, launches and team experiences delivered with polished execution.",
    image: "/modern.png",
  },
  {
    title: "Private Celebrations",
    description: "Birthdays, anniversaries and milestones made personal and memorable.",
    image: "/Bohemian.png",
  },
];

const testimonials = [
  {
    quote:
      "Bandhan understood our budget and introduced us to the right decorator and photographer within a day.",
    name: "Riya & Aman",
    event: "Wedding, Indore",
  },
  {
    quote:
      "We stopped chasing vendors and received clear quotations in one place. The planning felt genuinely easy.",
    name: "Neha Sharma",
    event: "Engagement, Jaipur",
  },
  {
    quote:
      "Our launch event came together on a tight timeline without compromising the guest experience.",
    name: "Arjun Mehta",
    event: "Corporate launch, Mumbai",
  },
];

const faqs = [
  {
    question: "How quickly will your team contact me?",
    answer:
      "A planning specialist will usually contact you within 24 hours after you submit the enquiry form.",
  },
  {
    question: "Can you work within a fixed budget?",
    answer:
      "Yes. We shortlist vendors based on your priorities, city and comfortable budget range before sharing options.",
  },
  {
    question: "Are the vendors verified?",
    answer:
      "Our featured professionals are reviewed for portfolio quality, reliability and service experience before recommendation.",
  },
  {
    question: "Do you support events outside major cities?",
    answer:
      "Yes. Tell us the event location and we will confirm suitable local or travelling vendor options.",
  },
];

export default function LeadSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section className="border-y border-[var(--bhn-border)] bg-[var(--bhn-surface)] px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 text-center md:grid-cols-4">
          {[
            ["500+", "Trusted vendors"],
            ["25+", "Cities covered"],
            ["1,200+", "Events supported"],
            ["4.8/5", "Client satisfaction"],
          ].map(([value, label]) => (
            <div key={label}>
              <strong className="block font-serif text-3xl text-[var(--bhn-brand-600)] sm:text-4xl">
                {value}
              </strong>
              <span className="mt-1 block text-sm text-[var(--bhn-text-muted)]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[var(--bhn-surface-2)] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-9 max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase text-[var(--bhn-brand-600)]">Every occasion</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight text-[var(--bhn-text)] sm:text-5xl">
              One planning partner for every kind of event.
            </h2>
            <p className="mt-4 leading-7 text-[var(--bhn-text-muted)]">
              Tell us the feeling you want to create. We’ll help assemble the venue,
              vendors and details that bring it to life.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {eventTypes.map((eventType) => (
              <article
                key={eventType.title}
                className="group relative min-h-[430px] overflow-hidden rounded-[var(--bhn-radius-lg)] ring-1 ring-[var(--bhn-border)]"
              >
                <Image
                  src={eventType.image}
                  alt={eventType.title}
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--bhn-text-on-brand)]">
                  <h3 className="font-serif text-3xl">{eventType.title}</h3>
                  <p className="mt-2 text-sm leading-6 opacity-85">
                    {eventType.description}
                  </p>
                  <button
                    type="button"
                    onClick={openContact}
                    className="mt-5 font-medium text-[var(--bhn-brand-300)] hover:text-white"
                  >
                    Plan this event →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bhn-brand-950)] px-4 py-14 text-[var(--bhn-text-on-brand)] sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--bhn-brand-300)]">What you receive</p>
            <h2 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
              Thoughtful planning without the endless searching.
            </h2>
            <p className="mt-5 max-w-lg leading-7 opacity-70">
              Your enquiry gives our team the context to recommend relevant options,
              not a generic directory of vendors.
            </p>
            <button
              type="button"
              onClick={openContact}
              className="bhn-btn bhn-btn-primary bhn-btn-lg mt-7"
            >
              Get my event shortlist
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "Verified professionals", "Reliable vendors selected for quality and experience."],
              [MapPin, "Location-based options", "Recommendations that can genuinely serve your event city."],
              [CalendarCheck, "Date availability", "Save time by focusing on vendors available for your date."],
              [Sparkles, "Style-led matching", "Options chosen to suit your atmosphere, taste and priorities."],
            ].map(([Icon, title, description]) => {
              const FeatureIcon = Icon as typeof ShieldCheck;
              return (
                <div key={title as string} className="rounded-[var(--bhn-radius)] border border-white/10 bg-white/5 p-5">
                  <FeatureIcon className="text-[var(--bhn-brand-300)]" size={24} />
                  <h3 className="mt-4 text-lg font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 opacity-65">{description as string}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[var(--bhn-surface-2)] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-[var(--bhn-brand-600)]">Real experiences</p>
              <h2 className="mt-2 font-serif text-4xl text-[var(--bhn-text)] sm:text-5xl">
                Clients remember the celebration, not the planning stress.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-[var(--bhn-text-muted)]">
              <Star size={18} className="fill-[var(--bhn-brand-500)] text-[var(--bhn-brand-500)]" />
              Rated 4.8 by event hosts
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <blockquote key={testimonial.name} className="bhn-card p-6">
                <div className="flex gap-1 text-[var(--bhn-brand-500)]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} className="fill-current" />
                  ))}
                </div>
                <p className="mt-5 font-serif text-xl leading-8 text-[var(--bhn-text)]">
                  “{testimonial.quote}”
                </p>
                <footer className="mt-6 border-t border-[var(--bhn-border)] pt-4">
                  <strong className="block text-sm text-[var(--bhn-text)]">{testimonial.name}</strong>
                  <span className="text-sm text-[var(--bhn-text-muted)]">{testimonial.event}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section id="faqs" className="scroll-mt-24 bg-[var(--bhn-surface)] px-4 py-14 sm:px-6 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase text-[var(--bhn-brand-600)]">Questions</p>
            <h2 className="mt-2 font-serif text-4xl leading-tight text-[var(--bhn-text)] sm:text-5xl">
              A clear start to your planning journey.
            </h2>
            <p className="mt-4 leading-7 text-[var(--bhn-text-muted)]">
              Still unsure? Send an enquiry and our team will guide you without any
              obligation to book.
            </p>
          </div>

          <div className="divide-y divide-[var(--bhn-border)] border-y border-[var(--bhn-border)]">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={faq.question}>
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-[var(--bhn-text)]"
                    aria-expanded={isOpen}
                  >
                    {faq.question}
                    <ChevronDown
                      size={20}
                      className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {isOpen && <p className="pb-5 leading-7 text-[var(--bhn-text-muted)]">{faq.answer}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 sm:px-6">
        <div className="relative mx-auto min-h-[420px] max-w-7xl overflow-hidden rounded-[var(--bhn-radius-lg)]">
          <Image src="/premium.png" alt="Premium event celebration" fill sizes="(min-width: 1280px) 1280px, 100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: "color-mix(in srgb, var(--bhn-brand-950) 78%, transparent)" }} />
          <div className="relative flex min-h-[420px] flex-col items-center justify-center px-5 py-14 text-center text-[var(--bhn-text-on-brand)]">
            <p className="text-sm font-semibold uppercase text-[var(--bhn-brand-300)]">Your event starts here</p>
            <h2 className="mt-3 max-w-3xl font-serif text-4xl leading-tight sm:text-5xl md:text-6xl">
              One enquiry can save weeks of searching.
            </h2>
            <p className="mt-5 max-w-xl leading-7 opacity-75">
              Share your date, city and vision. We’ll help you take the next practical
              step toward a beautifully planned event.
            </p>
            <button
              type="button"
              onClick={openContact}
              className="bhn-btn bhn-btn-primary bhn-btn-lg mt-7"
            >
              Start planning now
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

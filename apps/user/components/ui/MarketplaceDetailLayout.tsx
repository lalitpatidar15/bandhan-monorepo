"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin, MessageCircle, Scale, ShieldCheck, Star, Users } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import toast from "react-hot-toast";

type Props = {
  kind: "Service" | "Venue";
  title: string;
  description: string;
  images: string[];
  rating?: number;
  location?: string;
  guests?: number;
  price: number;
  priceLabel: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
  onChat?: () => void;
  chatLabel?: string;
  details?: Array<{ label: string; value: string }>;
  providerName?: string;
  reviewCount?: number;
  inclusions?: string[];
  terms?: string[];
  id?: string;

};

const faqs = [
  ["How does booking work?", "Choose your preferred date and continue to the secure booking flow. The provider confirms the final availability."],
  ["Can I request a custom quote?", "Yes. Use Request Quote to share your date, guest count, location, and event requirements before booking."],
  ["What is included?", "Your final scope and inclusions are confirmed with the provider before payment."],
];

export default function MarketplaceDetailLayout(props: Props) {
  const [selected, setSelected] = useState(0);
  const images = props.images.filter(Boolean);
  const image = images[selected] || "/modern.png";
  const previous = () => setSelected((current) => (current === 0 ? images.length - 1 : current - 1));
  const next = () => setSelected((current) => (current === images.length - 1 ? 0 : current + 1));

  const { toggle, has } = useCompare();
  const compareId = props.id ? String(props.id) : "";
  const inCompare = compareId ? has(compareId) : false;
  const compareType = props.kind === "Venue" ? "venue" : "service";

  const handleCompareToggle = () => {
    if (!compareId) return;
    const result = toggle({
      id: compareId,
      type: compareType,
      title: props.title,
      image: images[0],
      priceLabel: props.priceLabel,
      meta: props.kind,
      rating: props.rating,
      seller: props.providerName,
    });
    if (result.ok) {
      toast.success(inCompare ? "Removed from compare" : "Added to compare");
    } else {
      toast.error(result.reason || "Could not add to compare");
    }
  };

  return <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:py-10">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(330px,.8fr)]">
      <section className="overflow-hidden rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] shadow-sm">
        <div className="relative aspect-[4/3] bg-[var(--bhn-surface-2)]">
          <Image src={image} alt={props.title} fill sizes="(min-width: 1024px) 60vw, 100vw" unoptimized className="object-cover" />
          {images.length > 1 && <><button aria-label="Previous image" onClick={previous} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--bhn-surface)_90%,transparent)] p-2 text-[var(--bhn-text)] shadow"><ChevronLeft size={18} /></button><button aria-label="Next image" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,var(--bhn-surface)_90%,transparent)] p-2 text-[var(--bhn-text)] shadow"><ChevronRight size={18} /></button></>}
        </div>
        {images.length > 1 && <div className="grid grid-cols-4 gap-2 p-3">{images.slice(0, 4).map((item, index) => <button key={`${item}-${index}`} onClick={() => setSelected(index)} className={`relative aspect-square overflow-hidden rounded-lg border-2 ${selected === index ? "border-[var(--bhn-brand-600)]" : "border-transparent"}`}><Image src={item} alt="" fill sizes="(min-width: 1024px) 15vw, 25vw" unoptimized className="object-cover" /></button>)}</div>}
      </section>

      <aside className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--bhn-text)]">{props.kind}</p>
        <h1 className="mt-2 font-serif text-3xl text-[var(--bhn-text)] sm:text-4xl">{props.title}</h1>


        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--bhn-text-muted)]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />{props.rating?.toFixed(1) || "New"}{props.reviewCount ? ` (${props.reviewCount} reviews)` : ""}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--bhn-text-muted)]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />{props.rating?.toFixed(1) || "New"}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[var(--bhn-text-muted)]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[var(--bhn-brand-600)] text-[var(--bhn-text)]" />{props.rating?.toFixed(1) || "New"}{props.reviewCount ? ` (${props.reviewCount} reviews)` : ""}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[var(--bhn-surface-2)]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <p className="mt-6 text-3xl font-bold text-[var(--bhn-text)]">₹{props.price.toLocaleString()}</p><p className="mt-1 text-sm text-[var(--bhn-text-muted)]">{props.priceLabel}</p>
{compareId && <button type="button" onClick={handleCompareToggle} className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${inCompare ? "bhn-chip bhn-chip-active" : "bhn-chip"}`} aria-label={inCompare ? "Remove from compare" : "Add to compare"}><Scale size={14} className={inCompare ? "text-[var(--bhn-text)]" : "text-[var(--bhn-text-muted)]"} />{inCompare ? "Comparing" : "Compare"}</button>}
        <div className="mt-6 space-y-3"><button onClick={props.onPrimary} className="h-12 w-full rounded-xl bg-[var(--bhn-brand-600)] font-semibold text-[var(--bhn-text-on-brand)] hover:bg-[var(--bhn-brand-600)]">{props.primaryLabel}</button><button onClick={props.onSecondary} className="h-12 w-full rounded-xl border border-[var(--bhn-border)] font-semibold text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]">{props.secondaryLabel}</button>{props.onChat && <button type="button" onClick={props.onChat} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--bhn-border)] font-semibold text-[var(--bhn-text)] hover:bg-[var(--bhn-surface-2)]"><MessageCircle size={17} />{props.chatLabel || "Message provider"}</button>}</div>
        <div className="mt-6 space-y-3 border-t border-[var(--bhn-border)] pt-5 text-sm text-[var(--bhn-text-muted)]"><p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-[var(--bhn-text)]" />Trusted Bandhan partner</p><p className="flex gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-[var(--bhn-text)]" />Availability confirmed before payment</p></div>
      </aside>
    </div>


    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[var(--bhn-text-muted)]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[var(--bhn-surface-2)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--bhn-text)]">{detail.label}</p><p className="mt-1 font-medium text-[var(--bhn-text)]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Provider information</h2><p className="mt-3 text-sm font-semibold text-[var(--bhn-text)]">{props.providerName || "Bandhan verified partner"}</p><p className="mt-1 text-sm text-[var(--bhn-text-muted)]">Replies to your quote with availability, inclusions, and final pricing.</p><div className="mt-5 border-t border-[var(--bhn-border)] pt-4"><p className="flex gap-2 text-sm text-[var(--bhn-text-muted)]"><Clock3 className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />Availability is confirmed before payment.</p></div></aside></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">What your quote can include</h2><ul className="mt-4 space-y-3 text-sm text-[var(--bhn-text-muted)]">{(props.inclusions?.length ? props.inclusions : ["A scope tailored to your event requirements", "Availability and delivery or setup coordination", "Clear inclusions and final pricing before payment"]).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />{item}</li>)}</ul></section><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Booking and cancellation</h2><ul className="mt-4 space-y-3 text-sm text-[var(--bhn-text-muted)]">{(props.terms?.length ? props.terms : ["Request a quote for the exact date, guest count, and scope.", "Review the provider's confirmation before making payment.", "Cancellation and change terms are shown before checkout."]).map((item) => <li key={item} className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />{item}</li>)}</ul></section></div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[var(--bhn-text-muted)]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[var(--bhn-surface-2)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--bhn-text)]">{detail.label}</p><p className="mt-1 font-medium text-[var(--bhn-text)]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Why book with Bandhan?</h2><ul className="mt-5 space-y-3 text-sm text-[var(--bhn-text-muted)]">{["Verified providers and listings", "Clear quote and booking process", "Support through your event"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />{item}</li>)}</ul></aside></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[var(--bhn-text-muted)]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[var(--bhn-surface-2)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--bhn-text)]">{detail.label}</p><p className="mt-1 font-medium text-[var(--bhn-text)]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface-2)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Provider information</h2><p className="mt-3 text-sm font-semibold text-[var(--bhn-text)]">{props.providerName || "Bandhan verified partner"}</p><p className="mt-1 text-sm text-[var(--bhn-text-muted)]">Replies to your quote with availability, inclusions, and final pricing.</p><div className="mt-5 border-t border-[var(--bhn-border)] pt-4"><p className="flex gap-2 text-sm text-[var(--bhn-text-muted)]"><Clock3 className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />Availability is confirmed before payment.</p></div></aside></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">What your quote can include</h2><ul className="mt-4 space-y-3 text-sm text-[var(--bhn-text-muted)]">{(props.inclusions?.length ? props.inclusions : ["A scope tailored to your event requirements", "Availability and delivery or setup coordination", "Clear inclusions and final pricing before payment"]).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />{item}</li>)}</ul></section><section className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Booking and cancellation</h2><ul className="mt-4 space-y-3 text-sm text-[var(--bhn-text-muted)]">{(props.terms?.length ? props.terms : ["Request a quote for the exact date, guest count, and scope.", "Review the provider's confirmation before making payment.", "Cancellation and change terms are shown before checkout."]).map((item) => <li key={item} className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[var(--bhn-text)]" />{item}</li>)}</ul></section></div>
    <section className="mt-8 rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-6"><h2 className="font-serif text-2xl text-[var(--bhn-text)]">Common questions</h2><div className="mt-4 divide-y divide-[var(--bhn-border)]">{faqs.map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer font-medium text-[var(--bhn-text)]">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--bhn-text-muted)]">{answer}</p></details>)}</div></section>
  </div>;
}

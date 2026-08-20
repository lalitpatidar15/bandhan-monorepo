"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, Clock3, MapPin, Scale, ShieldCheck, Star, Users } from "lucide-react";
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
      <section className="overflow-hidden rounded-2xl border border-[#E5D8CC] bg-white shadow-sm">
        <div className="relative aspect-[4/3] bg-[#F3ECE4]">
          <Image src={image} alt={props.title} fill sizes="(min-width: 1024px) 60vw, 100vw" unoptimized className="object-cover" />
          {images.length > 1 && <><button aria-label="Previous image" onClick={previous} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#7A3F23] shadow"><ChevronLeft size={18} /></button><button aria-label="Next image" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-[#7A3F23] shadow"><ChevronRight size={18} /></button></>}
        </div>
        {images.length > 1 && <div className="grid grid-cols-4 gap-2 p-3">{images.slice(0, 4).map((item, index) => <button key={`${item}-${index}`} onClick={() => setSelected(index)} className={`relative aspect-square overflow-hidden rounded-lg border-2 ${selected === index ? "border-[#B65B2D]" : "border-transparent"}`}><Image src={item} alt="" fill sizes="(min-width: 1024px) 15vw, 25vw" unoptimized className="object-cover" /></button>)}</div>}
      </section>

      <aside className="rounded-2xl border border-[#E5D8CC] bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#B65B2D]">{props.kind}</p>
        <h1 className="mt-2 font-serif text-3xl text-[#1C1A16] sm:text-4xl">{props.title}</h1>


        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#6B625A]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[#C2652A] text-[#C2652A]" />{props.rating?.toFixed(1) || "New"}{props.reviewCount ? ` (${props.reviewCount} reviews)` : ""}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#6B625A]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[#C2652A] text-[#C2652A]" />{props.rating?.toFixed(1) || "New"}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#6B625A]"><span className="inline-flex items-center gap-1"><Star size={15} className="fill-[#C2652A] text-[#C2652A]" />{props.rating?.toFixed(1) || "New"}{props.reviewCount ? ` (${props.reviewCount} reviews)` : ""}</span>{props.location && <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><MapPin size={14} />{props.location}</span></>}{props.guests ? <><span className="h-1 w-1 rounded-full bg-[#CDBBAE]" /><span className="inline-flex items-center gap-1"><Users size={14} />Up to {props.guests.toLocaleString()} guests</span></> : null}</div>

        <p className="mt-6 text-3xl font-bold text-[#1C1A16]">₹{props.price.toLocaleString()}</p><p className="mt-1 text-sm text-[#6B625A]">{props.priceLabel}</p>
{compareId && <button type="button" onClick={handleCompareToggle} className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${inCompare ? "bhn-chip bhn-chip-active" : "bhn-chip"}`} aria-label={inCompare ? "Remove from compare" : "Add to compare"}><Scale size={14} className={inCompare ? "text-[#C25E2B]" : "text-[#8A786A]"} />{inCompare ? "Comparing" : "Compare"}</button>}
        <div className="mt-6 space-y-3"><button onClick={props.onPrimary} className="h-12 w-full rounded-xl bg-[#873700] font-semibold text-white hover:bg-[#6D2D00]">{props.primaryLabel}</button><button onClick={props.onSecondary} className="h-12 w-full rounded-xl border border-[#DCCABC] font-semibold text-[#3E3027] hover:bg-[#FCF7F1]">{props.secondaryLabel}</button></div>
        <div className="mt-6 space-y-3 border-t border-[#F0E6DE] pt-5 text-sm text-[#6B625A]"><p className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-[#B65B2D]" />Trusted Bandhan partner</p><p className="flex gap-2"><CalendarDays className="mt-0.5 h-4 w-4 text-[#B65B2D]" />Availability confirmed before payment</p></div>
      </aside>
    </div>


    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[#5F554E]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[#FCF7F1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#9A7E6C]">{detail.label}</p><p className="mt-1 font-medium text-[#332720]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[#E5D8CC] bg-[#FCF7F1] p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Provider information</h2><p className="mt-3 text-sm font-semibold text-[#332720]">{props.providerName || "Bandhan verified partner"}</p><p className="mt-1 text-sm text-[#5F554E]">Replies to your quote with availability, inclusions, and final pricing.</p><div className="mt-5 border-t border-[#E9DCD1] pt-4"><p className="flex gap-2 text-sm text-[#5F554E]"><Clock3 className="h-4 w-4 shrink-0 text-[#B65B2D]" />Availability is confirmed before payment.</p></div></aside></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">What your quote can include</h2><ul className="mt-4 space-y-3 text-sm text-[#5F554E]">{(props.inclusions?.length ? props.inclusions : ["A scope tailored to your event requirements", "Availability and delivery or setup coordination", "Clear inclusions and final pricing before payment"]).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#B65B2D]" />{item}</li>)}</ul></section><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Booking and cancellation</h2><ul className="mt-4 space-y-3 text-sm text-[#5F554E]">{(props.terms?.length ? props.terms : ["Request a quote for the exact date, guest count, and scope.", "Review the provider's confirmation before making payment.", "Cancellation and change terms are shown before checkout."]).map((item) => <li key={item} className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[#B65B2D]" />{item}</li>)}</ul></section></div>

    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[#5F554E]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[#FCF7F1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#9A7E6C]">{detail.label}</p><p className="mt-1 font-medium text-[#332720]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[#E5D8CC] bg-[#FCF7F1] p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Why book with Bandhan?</h2><ul className="mt-5 space-y-3 text-sm text-[#5F554E]">{["Verified providers and listings", "Clear quote and booking process", "Support through your event"].map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#B65B2D]" />{item}</li>)}</ul></aside></div>
    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]"><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">About this {props.kind.toLowerCase()}</h2><p className="mt-4 whitespace-pre-line leading-7 text-[#5F554E]">{props.description || "Details will be confirmed directly with the provider."}</p><div className="mt-6 grid gap-3 sm:grid-cols-2">{(props.details || []).map((detail) => <div key={detail.label} className="rounded-xl bg-[#FCF7F1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#9A7E6C]">{detail.label}</p><p className="mt-1 font-medium text-[#332720]">{detail.value}</p></div>)}</div></section><aside className="rounded-2xl border border-[#E5D8CC] bg-[#FCF7F1] p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Provider information</h2><p className="mt-3 text-sm font-semibold text-[#332720]">{props.providerName || "Bandhan verified partner"}</p><p className="mt-1 text-sm text-[#5F554E]">Replies to your quote with availability, inclusions, and final pricing.</p><div className="mt-5 border-t border-[#E9DCD1] pt-4"><p className="flex gap-2 text-sm text-[#5F554E]"><Clock3 className="h-4 w-4 shrink-0 text-[#B65B2D]" />Availability is confirmed before payment.</p></div></aside></div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">What your quote can include</h2><ul className="mt-4 space-y-3 text-sm text-[#5F554E]">{(props.inclusions?.length ? props.inclusions : ["A scope tailored to your event requirements", "Availability and delivery or setup coordination", "Clear inclusions and final pricing before payment"]).map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="h-4 w-4 shrink-0 text-[#B65B2D]" />{item}</li>)}</ul></section><section className="rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Booking and cancellation</h2><ul className="mt-4 space-y-3 text-sm text-[#5F554E]">{(props.terms?.length ? props.terms : ["Request a quote for the exact date, guest count, and scope.", "Review the provider's confirmation before making payment.", "Cancellation and change terms are shown before checkout."]).map((item) => <li key={item} className="flex gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-[#B65B2D]" />{item}</li>)}</ul></section></div>
    <section className="mt-8 rounded-2xl border border-[#E5D8CC] bg-white p-6"><h2 className="font-serif text-2xl text-[#1C1A16]">Common questions</h2><div className="mt-4 divide-y divide-[#EEE2D8]">{faqs.map(([question, answer]) => <details key={question} className="py-4"><summary className="cursor-pointer font-medium text-[#332720]">{question}</summary><p className="mt-3 max-w-3xl text-sm leading-6 text-[#6B625A]">{answer}</p></details>)}</div></section>
  </div>;
}

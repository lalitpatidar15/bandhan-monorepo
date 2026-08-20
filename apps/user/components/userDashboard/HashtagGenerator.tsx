"use client";

import { useState } from "react";
import { Copy, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

interface HashtagGeneratorProps {
  className?: string;
  defaultEventType?: string;
  defaultLocation?: string;
}

const EVENT_TYPE_OPTIONS = [
  "Wedding",
  "Engagement",
  "Reception",
  "Cocktail",
  "Mehndi",
  "Sangeet",
  "Birthday",
  "Anniversary",
  "Baby Shower",
  "Corporate",
];

const toPascal = (str: string) =>
  str
    .toLowerCase()
    .replace(/(^\w|_\w|\s+\w)/g, (m) => m.replace(/[_\s]/g, "").toUpperCase());

export default function HashtagGenerator({ className = "", defaultEventType, defaultLocation }: HashtagGeneratorProps) {
  const [eventType, setEventType] = useState(defaultEventType || "Wedding");
  const [theme, setTheme] = useState("");
  const [couple, setCouple] = useState("");
  const [city, setCity] = useState(defaultLocation || "");
  const [hashtags, setHashtags] = useState<string[]>([]);

  const generateHashtags = () => {
    const evt = eventType.trim() || "Wedding";
    const themeKw = theme.trim() || "Celebration";
    const coupleKw = couple.trim() || "";
    const cityKw = city.trim() || "Venue";

    const evtPascal = toPascal(evt);
    const themePascal = toPascal(themeKw);
    const couplePascal = coupleKw
      ? toPascal(coupleKw).replace(/\s+/g, "")
      : "";
    const cityPascal = toPascal(cityKw);

    const result: string[] = [];

    result.push("#BandhanWeddings");

    const trendingPrefixes = ["Trending", "Vibes", "Moments", "Magic", "Love", "Celebrate"];
    const trending = trendingPrefixes[Math.floor(Math.random() * trendingPrefixes.length)];
    result.push(`#${trending}${evtPascal}`);

    result.push(`#${evtPascal}Inspiration`);

    result.push(`#${themePascal}Wedding`);

    result.push(`#${themePascal}Vibes`);

    result.push(`#${cityPascal}Weddings`);

    if (couplePascal) {
      result.push(`#${couplePascal}Wedding`);
    } else {
      result.push(`#${cityPascal}LoveStory`);
    }

    result.push("#BridalBliss");

    result.push("#BridalGoals");

    const vendorPrefixes = ["Makeup", "Floral", "Catering", "Photography", "Decor"];
    const vendor = vendorPrefixes[Math.floor(Math.random() * vendorPrefixes.length)];
    result.push(`#${vendor}${evtPascal}`);

    result.push(`#${cityPascal}${evtPascal}`);

    result.push(`#Bandhan${evtPascal}`);

    result.push(`#${themePascal}${vendor}Ideas`);

    result.push("#WeddingPlanning");

    if (couplePascal) {
      result.push(`#${couplePascal}${cityPascal}`);
    } else {
      result.push(`#${cityPascal}VenueIdeas`);
    }

    const unique = Array.from(new Set(result));
    setHashtags(unique.slice(0, 12));
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${text} copied!`, { duration: 1500 });
    } catch {
      toast.error("Could not copy. Try manually.", { duration: 1500 });
    }
  };

  const copyAll = async () => {
    if (!hashtags.length) return;
    const all = hashtags.join(" ");
    try {
      await navigator.clipboard.writeText(all);
      toast.success("All hashtags copied!", { duration: 2000 });
    } catch {
      toast.error("Could not copy all hashtags.", { duration: 2000 });
    }
  };

  return (
    <div className={["bhn-card p-6 space-y-5", className].filter(Boolean).join(" ")}>
      <div className="flex items-center gap-3">
        <Sparkles size={20} className="text-[var(--bhn-brand-600)]" />
        <h3 className="font-display text-lg font-bold text-[var(--bhn-text)]">
          Hashtag Generator
        </h3>
      </div>

      <p className="text-xs text-[var(--bhn-text-muted)]">
        Generate copyable hashtags for your event. Fill in the details and click
        Generate.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">
            Event Type
          </label>
          <select
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="bhn-select w-full"
          >
            {EVENT_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">
            Theme / Keywords
          </label>
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="e.g. Rustic, Boho, Modern..."
            className="bhn-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">
            Couple / Names
          </label>
          <input
            type="text"
            value={couple}
            onChange={(e) => setCouple(e.target.value)}
            placeholder="e.g. Aarav & Meera"
            className="bhn-input w-full"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-[var(--bhn-text)]">
            City
          </label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Mumbai, Delhi..."
            className="bhn-input w-full"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={generateHashtags}
        disabled={!eventType}
        className="bhn-btn bhn-btn-primary w-full gap-2"
      >
        <Sparkles size={16} />
        Generate Hashtags
      </button>

      {hashtags.length > 0 ? (
        <div className="space-y-4 pt-2">
          <div className="flex flex-wrap gap-2">
            {hashtags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => copyToClipboard(tag)}
                className="bhn-chip text-xs"
                title="Click to copy"
              >
                {tag}
                <Copy size={10} className="ml-1 opacity-50" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={copyAll}
            className="bhn-btn bhn-btn-secondary bhn-btn-block text-xs"
          >
            Copy All
          </button>
        </div>
      ) : (
        <div className="pt-2 text-center text-xs text-[var(--bhn-text-soft)]">
          {hashtags.length === 0 && "Your generated hashtags will appear here."}
        </div>
      )}
    </div>
  );
}

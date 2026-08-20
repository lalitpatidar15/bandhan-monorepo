import type { ReactNode } from "react";
import { Check } from "lucide-react";

export interface TimelineItem {
  title: ReactNode;
  description?: ReactNode;
  status?: "done" | "active" | "pending";
  icon?: ReactNode;
}

export interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function Timeline({ items, className = "" }: TimelineProps) {
  return (
    <ul className={["bhn-timeline", className].filter(Boolean).join(" ")}>
      {items.map((item, i) => {
        const status = item.status ?? (i < items.length - 1 && i < 1 ? "done" : "pending");
        return (
          <li
            key={i}
            className={[
              "bhn-timeline-item",
              status === "done" ? "bhn-timeline-item-done" : "",
              status === "active" ? "bhn-timeline-item-active" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <span className="bhn-timeline-dot">{status === "done" ? (item.icon ?? <Check size={12} />) : item.icon}</span>
            <div className="bhn-timeline-content">
              <p className="bhn-timeline-title">{item.title}</p>
              {item.description ? <p className="bhn-timeline-desc">{item.description}</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
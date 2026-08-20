import type { ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  variant?: "pill" | "line";
  className?: string;
}

export function Tabs({ items, active, onChange, variant = "pill", className = "" }: TabsProps) {
  return (
    <div className={["bhn-tabs", className].filter(Boolean).join(" ")} role="tablist">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={active === item.id}
          className={["bhn-tab", variant === "line" ? "bhn-tab-line" : "", active === item.id ? "bhn-tab-active" : ""]
            .filter(Boolean)
            .join(" ")}
          onClick={() => onChange(item.id)}
        >
          {item.icon}
          {item.label}
          {item.badge}
        </button>
      ))}
    </div>
  );
}
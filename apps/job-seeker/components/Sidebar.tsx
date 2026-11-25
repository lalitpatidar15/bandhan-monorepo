// components/Sidebar.tsx
import Link from "next/link";
import Image from "next/image";
import { BriefcaseBusiness, CreditCard, FileText, LayoutDashboard, MessageSquare } from "lucide-react";

const items = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/Jobseeker/dashboard" },
  { label: "Jobs", icon: BriefcaseBusiness, href: "/Jobseeker/jobs" },
  { label: "Applications", icon: FileText, href: "/Jobseeker/applications" },
  { label: "Messages", icon: MessageSquare, href: "/Jobseeker/messages" },
  { label: "Payments", icon: CreditCard, href: "/Jobseeker/payments" },
];

export function Sidebar({ active = "Jobs" }) {
  const normalizedActive = active?.toLowerCase().trim();

  return (
    <aside className="sticky top-6 h-fit w-full overflow-hidden rounded-xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] shadow-[0_5px_18px_rgba(42,28,22,.04)] lg:w-64">
      <div className="flex min-h-[72px] items-center justify-between border-b border-[var(--bhn-border)] px-4 py-4">
        <Image src="/Group1.png" alt="Bandhan Careers" width={433} height={96} className="h-8 w-auto rounded-lg bg-[var(--bhn-neutral-950)] px-2 py-1.5" />
        <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--bhn-brand-600)]">Careers</span>
      </div>

      <p className="mb-2 px-5 pt-5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[var(--bhn-text-muted)]">Job seeker</p>

      <nav className="space-y-1 px-3 pb-5">
        {items.map((item) => {
          const isActive = normalizedActive === item.label.toLowerCase();
          const Icon = item.icon;
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "bhn-btn-primary"
                  : "text-[var(--bhn-text-muted)] hover:bg-[var(--bhn-surface-2)] hover:text-[var(--bhn-text)]"
              }`}
            >
              <Icon size={17} className="shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
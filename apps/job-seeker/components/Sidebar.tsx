// components/Sidebar.tsx
import Link from "next/link";

const items = [
  { label: "Dashboard", icon: "🏠", href: "/Jobseeker/dashboard" },
  { label: "Jobs", icon: "💼", href: "/Jobseeker/jobs" },
  { label: "Applications", icon: "📄", href: "/Jobseeker/applications" },
  { label: "Messages", icon: "✉️", href: "/Jobseeker/messages" },
  { label: "Payments", icon: "💳", href: "/Jobseeker/payments" },
];

export function Sidebar({ active = "Jobs" }) {
  const normalizedActive = active?.toLowerCase().trim();

  return (
    <div className="w-full lg:w-80 bg-[#FFF6F1] dark:bg-[#1a1a1a] rounded-3xl p-4 border border-[#E8DDD5] dark:border-[#374151] shadow-sm sticky top-6 h-fit">
      <div className="mb-6 flex items-center justify-between rounded-2xl bg-[#FAE8DE] dark:bg-[#2a2018] px-4 py-3 text-sm font-semibold text-[#7A3F23] dark:text-[#c9a882]">
        <span>Bandhan</span>
        <span className="text-xs uppercase tracking-widest text-[#AF8B71] dark:text-[#8b7060] font-medium">Jobs</span>
      </div>

      <p className="text-[10px] tracking-widest text-[#A08070] dark:text-[#7a6a5a] mb-5 font-semibold uppercase">Seeker Portal</p>

      <div className="space-y-2">
        {items.map((item) => {
          const isActive = normalizedActive === item.label.toLowerCase();
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition relative ${
                isActive
                  ? "bg-white dark:bg-[#2a2a2a] shadow-sm text-[#6C3E22] dark:text-[#c9a882] font-semibold border border-[#E8DDD5] dark:border-[#374151]"
                  : "text-[#8A6D5A] dark:text-[#a89080] hover:bg-white/60 dark:hover:bg-white/10"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-8 bg-[#C97755] dark:bg-[#c9a882] rounded-full"></span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
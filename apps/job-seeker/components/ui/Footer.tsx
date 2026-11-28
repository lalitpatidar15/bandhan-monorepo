import Link from "next/link";

const FOOTER_LINKS = [
  { label: "Privacy Policy", href: "/jobposter/privacy-policy" },
  { label: "Terms", href: "/jobposter/terms-of-service" },
  { label: "Cookie Policy", href: "/jobposter/cookie-policy" },
  { label: "Support", href: "/jobposter/contact-support" },
];

export function Footer() {
  return (
    <footer className="bg-[var(--bhn-surface-2)] pt-6 pb-4 text-sm text-[var(--bhn-text-muted)]">
      <div className="mx-auto max-w-7xl flex flex-col items-center justify-between gap-4 md:flex-row">
        <div className="font-medium text-[var(--bhn-text)]">Bandhan Careers</div>

        <nav aria-label="Legal and support" className="flex flex-wrap items-center justify-center gap-6">
          {FOOTER_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer transition hover:text-[var(--bhn-text)]"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="text-xs text-[var(--bhn-text-soft)]">
          © {new Date().getFullYear()} Bandhan Careers. Cultivating professional growth.
        </div>
      </div>
    </footer>
  );
}

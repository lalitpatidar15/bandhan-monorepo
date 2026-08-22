import { LoaderCircle, ShieldCheck } from "lucide-react";

export interface SsoLoadingScreenProps {
  portalName?: string;
}

/** A neutral transition screen while a short-lived SSO grant is exchanged for a portal session. */
export function SsoLoadingScreen({ portalName = "your Bandhan portal" }: SsoLoadingScreenProps) {
  return (
    <main
      className="flex min-h-screen items-center justify-center overflow-hidden px-5"
      style={{ background: "radial-gradient(circle at top, var(--bhn-brand-50), var(--bhn-bg) 52%)" }}
      aria-live="polite"
      aria-busy="true"
    >
      <section
        className="w-full max-w-md rounded-3xl border p-8 text-center shadow-xl sm:p-10"
        style={{ background: "var(--bhn-surface)", borderColor: "var(--bhn-border)" }}
      >
        <span
          className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "var(--bhn-brand-50)", color: "var(--bhn-brand-700)" }}
        >
          <ShieldCheck size={30} aria-hidden="true" />
        </span>
        <div className="mt-6 flex justify-center">
          <LoaderCircle className="animate-spin" size={28} style={{ color: "var(--bhn-brand-600)" }} aria-hidden="true" />
        </div>
        <h1 className="mt-5 text-xl font-bold" style={{ color: "var(--bhn-text)" }}>Signing you in securely</h1>
        <p className="mt-2 text-sm leading-6" style={{ color: "var(--bhn-text-muted)" }}>
          Setting up your session and opening {portalName}.
        </p>
      </section>
    </main>
  );
}

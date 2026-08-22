import { Check, ShieldCheck } from "lucide-react";

export interface SsoLoadingScreenProps {
  portalName?: string;
}

/** A neutral transition screen while a short-lived SSO grant is exchanged for a portal session. */
export function SsoLoadingScreen({ portalName = "your Bandhan portal" }: SsoLoadingScreenProps) {
  return (
    <main className="bhn-sso-screen" aria-live="polite" aria-busy="true">
      <div className="bhn-sso-orb bhn-sso-orb-one" />
      <div className="bhn-sso-orb bhn-sso-orb-two" />
      <section className="bhn-sso-card">
        <div className="bhn-sso-mark" aria-hidden="true">
          <span className="bhn-sso-ring bhn-sso-ring-one" />
          <span className="bhn-sso-ring bhn-sso-ring-two" />
          <span className="bhn-sso-shield"><ShieldCheck size={31} /></span>
        </div>
        <div className="bhn-sso-steps" aria-hidden="true">
          <span><Check size={12} /></span><i /><span className="bhn-sso-step-active" /><i /><span />
        </div>
        <h1>Signing you in securely</h1>
        <p>Setting up your session and opening {portalName}.</p>
        <div className="bhn-sso-progress" aria-hidden="true"><span /></div>
        <div className="bhn-sso-dots" aria-hidden="true"><i /><i /><i /></div>
      </section>
    </main>
  );
}

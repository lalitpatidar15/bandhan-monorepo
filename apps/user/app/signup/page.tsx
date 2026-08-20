import Link from "next/link";
import Image from "next/image";
import { registrationRoles } from "@bandhan/config";

export default function SignupRolePage() {
  return (
    <main className="min-h-screen bg-[var(--bhn-bg)] px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Image src="/Group1.png" alt="Bandhan Events Hub" width={433} height={96} className="mx-auto h-12 w-auto brightness-0" priority />
          <h1 className="mt-6 text-3xl font-bold text-[var(--bhn-text)]">How will you use Bandhan?</h1>
          <p className="mt-2 text-[var(--bhn-text-muted)]">Choose a role to create the right account. Admin accounts are managed separately.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registrationRoles.map((role) => (
            <Link key={role.role} href={`/signup/${role.role}`} className="group rounded-2xl border border-[var(--bhn-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--bhn-brand-500)] hover:shadow-md">
              <h2 className="text-lg font-semibold text-[var(--bhn-text)] group-hover:text-[var(--bhn-brand-700)]">{role.title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--bhn-text-muted)]">{role.description}</p>
              <span className="mt-5 inline-block text-sm font-semibold text-[var(--bhn-brand-700)]">Create account →</span>
            </Link>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-[var(--bhn-text-muted)]">Already have an account? <Link href="/login" className="font-semibold text-[var(--bhn-brand-700)] hover:underline">Sign in</Link></p>
      </section>
    </main>
  );
}

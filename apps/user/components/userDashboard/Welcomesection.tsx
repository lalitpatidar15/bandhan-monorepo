export default function WelcomeSection() {
  return (
    <div className="mb-4 text-center">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--bhn-text)] mb-2">
        Bandhan
      </p>

      <h1 className="text-xl sm:text-2xl font-serif font-semibold text-[var(--bhn-text)]">
        Choose your path
      </h1>

      <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--bhn-text-muted)]">
        Tell us how you’ll be using Bandhan.
      </p>
    </div>
  );
}
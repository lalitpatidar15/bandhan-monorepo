import Image from "next/image";

export default function GetInTouch() {
  return (
    <section className="py-12 px-6">
      <div className="bhn-card max-w-4xl mx-auto text-center p-4 sm:p-6">

        {/* avatars */}
        <div className="flex justify-center -space-x-4 mb-6">
  <Image
    src="/avatar1.png"
    alt="Bandhan support specialist"
    width={48}
    height={48}
    className="w-12 h-12 rounded-full border-2 border-[var(--bhn-surface)] bg-[var(--bhn-surface-3)] relative z-10"
  />

  <Image
    src="/avatar2.png"
    alt="Bandhan support specialist"
    width={48}
    height={48}
    className="w-12 h-12 rounded-full border-2 border-[var(--bhn-surface)] bg-[var(--bhn-surface-3)] relative z-20"
  />

  <Image
    src="/avatar3.png"
    alt="Bandhan support specialist"
    width={48}
    height={48}
    className="w-12 h-12 rounded-full border-2 border-[var(--bhn-surface)] bg-[var(--bhn-surface-3)] relative z-10"
  />
</div>

        <h3 className="text-xl font-semibold text-[var(--bhn-text)] mb-2">
          Still have questions?
        </h3>

        <p className="text-[var(--bhn-text-muted)] mb-6">
          Can’t find the answer you’re looking for? Please chat to our friendly team.
        </p>

        <button className="bhn-btn bhn-btn-primary bhn-btn-lg">
          Get in touch
        </button>

      </div>
    </section>
  );
}

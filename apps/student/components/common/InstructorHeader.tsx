"use client";

import AcademyLogo from "@/components/common/AcademyLogo";

type Props = {
  step: number;
  totalSteps: number;
};

export default function InstructorHeader({
  step,
  totalSteps,
}: Props) {
  const percentage = (step / totalSteps) * 100;

  return (
    <div
      className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-4
        px-4
        sm:px-6
        lg:px-12
        py-4
        sm:py-5
        bg-white
        border-b
        border-[var(--bhn-border)]
      "
    >

      {/* LEFT (LOGO) */}
      <div className="flex items-center justify-center sm:justify-start">
        <AcademyLogo className="h-8 sm:h-9 w-auto object-contain" />
      </div>

      {/* RIGHT (STEP INFO) */}
      <div
        className="
          flex
          flex-col
          sm:flex-row
          items-center
          gap-3
          sm:gap-5
          w-full
          sm:w-auto
        "
      >

        <span
          className="
            text-[var(--bhn-brand-700)]
            font-medium
            text-sm
            sm:text-base
            whitespace-nowrap
          "
        >
          Step {step} of {totalSteps}
        </span>

        {/* PROGRESS BAR */}
        <div
          className="
            w-full
            sm:w-[180px]
            lg:w-[220px]
            h-[8px]
            bg-[var(--bhn-surface-3)]
            rounded-full
            overflow-hidden
          "
        >
          <div
            className="
              h-full
              bg-[var(--bhn-brand-500)]
              rounded-full
              transition-all
              duration-300
            "
            style={{ width: `${percentage}%` }}
          />
        </div>

        <span
          className="
            text-[var(--bhn-text-muted)]
            text-sm
            sm:text-base
            whitespace-nowrap
          "
        >
          {Math.round(percentage)}% Complete
        </span>

      </div>
    </div>
  );
}

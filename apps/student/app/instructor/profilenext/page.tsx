"use client";

import { useState } from "react";
import InstructorHeader from "@/components/common/InstructorHeader";
import { useRouter } from "next/navigation";

export default function NextPage() {
  const [step] = useState(2);
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[var(--bhn-bg)] flex flex-col overflow-x-hidden">

      {/* HEADER */}
      <InstructorHeader step={step} totalSteps={3} />

      {/* CONTENT */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="bg-[var(--bhn-surface)] border border-[var(--bhn-border)] rounded-2xl p-5 sm:p-5 lg:p-4 max-w-2xl w-full text-center shadow-sm">
          <h2 className="text-2xl sm:text-xl font-semibold text-[var(--bhn-text)] mb-4">
            Verification
          </h2>

          <p className="text-[var(--bhn-text-soft)] leading-7">
            In the next step you'll be able to verify your identity using
            DigiLocker or upload your documents manually for review.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bhn-surface)] p-5 border-t">

        {/* BACK */}
        <button
          onClick={() => router.push("/instructor/profile")}
          className="text-[var(--bhn-brand-700)] font-medium border border-[#8B4A28] px-6 py-2 rounded-lg"
        >
          Back
        </button>

        {/* CONTINUE */}
        <button
          onClick={() => router.push("/instructor/profilelast")}
          className="bg-[var(--bhn-brand-600)] text-white px-6 py-2 rounded-lg"
        >
          Continue
        </button>

      </div>

    </div>
  );
}

"use client";

interface StepperProps {
  currentStep: number;
}

export const Stepper = ({ currentStep }: StepperProps) => {
  return (
    <div className="flex mt-2 items-center justify-center w-full max-w-3xl mx-auto gap-6">

  {/* Step 1 */}
  <div className="flex flex-col items-center min-w-[80px]">
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold
      ${
        currentStep >= 1
          ? "bg-[#5B2E0E] text-white"
          : "bg-gray-300 text-gray-600"
      }`}
    >
      1
    </div>
    <span className="text-xs mt-2 text-[#7A4A2A] tracking-wide">
      BASIC INFO
    </span>
  </div>

  {/* Line (AUTO EXPAND) */}
  <div className="flex-1 h-[2px] bg-gray-300 relative mx-4">
    <div
      className="absolute top-0 left-0 h-[2px] bg-[#5B2E0E] transition-all duration-300"
      style={{ width: currentStep === 2 ? "100%" : "0%" }}
    />
  </div>

  {/* Step 2 */}
  <div className="flex flex-col items-center min-w-[80px]">
    <div
      className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold
      ${
        currentStep >= 2
          ? "bg-[#5B2E0E] text-white"
          : "bg-gray-300 text-gray-600"
      }`}
    >
      2
    </div>
    <span className="text-xs mt-2 text-[#7A4A2A] tracking-wide">
      EXPERIENCE
    </span>
  </div>

</div>
  );
};
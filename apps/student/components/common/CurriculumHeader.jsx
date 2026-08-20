"use client";

import AcademyLogo from "@/components/common/AcademyLogo";

export default function CurriculumHeader({
  currentStep = 1,
}) {
  const steps = [
    "Basic Info",
    "Curriculum",
    "Content",
    "Pricing",
  ];

  return (
    <div
      className="
        w-full
        bg-white
        border-b
        border-[#E8DDD5]
        dark:border-[#374151]
        px-4
        sm:px-6
        lg:px-10
        py-4
        flex
        flex-col
        md:flex-row
        md:items-center
        md:justify-between
        gap-5
      "
    >

      {/* LOGO */}
      <div className="flex justify-center md:justify-start">
        <AcademyLogo className="h-8 sm:h-9 w-auto object-contain" />
      </div>

      {/* STEPS */}
      <div
        className="
          grid
          grid-cols-2
          sm:grid-cols-4
          gap-y-4
          gap-x-3
          w-full
          md:w-auto
        "
      >

        {steps.map((step, index) => {
          const stepNumber = index + 1;

          const isActive =
            currentStep === stepNumber;

          const isCompleted =
            currentStep > stepNumber;

          return (
            <div
              key={index}
              className="
                flex
                items-center
                justify-center
                sm:justify-start
                gap-2
              "
            >

              {/* CIRCLE */}
              <div
                className={`
                  w-6
                  h-6
                  sm:w-7
                  sm:h-7
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-[11px]
                  sm:text-xs
                  shrink-0
                  transition-all
                  duration-200

                  ${
                    isCompleted
                      ? "bg-[#8B4A28] text-white dark:bg-[#b86a3a]"
                      : ""
                  }

                  ${
                    isActive
                      ? "bg-[#8B4A28] text-white dark:bg-[#b86a3a]"
                      : ""
                  }

                  ${
                    !isActive && !isCompleted
                      ? "border border-[#D9CCC3] text-[#2D201B] dark:border-[#374151] dark:text-[#ededed]"
                      : ""
                  }
                `}
              >
                {isCompleted ? "✓" : stepNumber}
              </div>

              {/* TEXT */}
              <span
                className={`
                  text-xs
                  sm:text-sm
                  whitespace-nowrap
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "text-[#2D201B] font-medium dark:text-[#ededed]"
                      : "text-[#330000] opacity-70 dark:text-[#ededed]"
                  }
                `}
              >
                {step}
              </span>

            </div>
          );
        })}

      </div>

    </div>
  );
}

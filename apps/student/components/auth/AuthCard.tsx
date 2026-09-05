import AuthTabs from "./AuthTabs";
import AcademyLogo from "@/components/common/AcademyLogo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  role: "student" | "instructor";
  buttonText: string;
};

export default function AuthCard({
  title,
  subtitle,
  role,
  buttonText,
}: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* LEFT SIDE */}
      <div className="w-full md:w-1/2 bg-[var(--bhn-brand-50)] flex flex-col justify-center items-center p-6 sm:p-10 text-center min-h-[220px] md:min-h-screen">
        <AcademyLogo className="h-8 sm:h-10 w-auto object-contain mb-4" />
        <p className="text-base sm:text-lg text-[var(--bhn-text-muted)]">{subtitle}</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 sm:p-8 bg-[var(--bhn-bg)]">
        <div className="bg-[var(--bhn-surface)] shadow-lg rounded-2xl border border-[var(--bhn-border)] p-5 sm:p-8 w-full max-w-[400px]">
            <AuthTabs />
          <h2 className="text-2xl font-semibold mb-6 text-center text-[var(--bhn-text)]">
            {title}
          </h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="bhn-input"
            />

            <input
              type="password"
              placeholder="Password"
              className="bhn-input"
            />

            <button type="button" className="bhn-btn bhn-btn-primary">
              {buttonText}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-[var(--bhn-text-muted)]">
            {role === "student"
              ? "Login as Student"
              : "Login as Instructor"}
          </p>
        </div>
      </div>
    </div>
  );
}

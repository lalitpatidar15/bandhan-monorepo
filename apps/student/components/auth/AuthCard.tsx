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
      <div className="w-full md:w-1/2 bg-[#f5ebe6] dark:bg-[#1a1a1a] flex flex-col justify-center items-center p-6 sm:p-10 text-center min-h-[220px] md:min-h-screen">
        <AcademyLogo className="h-8 sm:h-10 w-auto object-contain mb-4" />
        <p className="text-base sm:text-lg text-gray-600">{subtitle}</p>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full md:w-1/2 flex justify-center items-center p-4 sm:p-8">
        <div className="bg-white shadow-lg rounded-xl p-5 sm:p-8 w-full max-w-[400px]">
            <AuthTabs />
          <h2 className="text-2xl font-semibold mb-6 text-center">
            {title}
          </h2>

          <form className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
            />

            <input
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
            />

            <button className="bg-brown-600 text-white py-2 rounded">
              {buttonText}
            </button>
          </form>

          <p className="text-sm text-center mt-4 text-gray-500">
            {role === "student"
              ? "Login as Student"
              : "Login as Instructor"}
          </p>
        </div>
      </div>
    </div>
  );
}

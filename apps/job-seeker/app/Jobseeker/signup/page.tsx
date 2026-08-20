"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { useRegisterMutation } from "../redux/services/AuthApi";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [register] = useRegisterMutation();

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 lowercase letter";
    } else if (!/\d/.test(formData.password)) {
      newErrors.password = "Password must contain at least 1 number";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register({
        fullName: formData.firstName,
        email: formData.email,
        password: formData.password,
      }).unwrap();
      router.push("/Jobseeker/profile");
    } catch {
      setErrors({ form: "Registration failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5E4DA] px-6 py-6 text-brown-950 sm:px-12 lg:px-20">
      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col items-center justify-center gap-6 lg:flex-row lg:items-stretch">
        {/* Left Section */}
        <section className="hidden flex-1 rounded-[40px] bg-[#F7E8DC] p-6 shadow-[0_35px_80px_-40px_rgba(0,0,0,0.18)] lg:block lg:p-16">
          <div className="max-w-xl space-y-8">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-brown-900/70">
              Bandhan Careers
            </p>
            <h1 className="text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-brown-950 sm:text-6xl">
              Join Our
              <br />
              Community
            </h1>
            <p className="text-base leading-8 text-brown-900/80 sm:text-lg">
              Create an account to access exclusive job opportunities, connect with top companies, and build your dream career.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-3xl bg-[#FFF4EE] p-5 shadow-sm">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-brown-900 text-white grid place-items-center text-sm font-semibold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-brown-950">Free to join</p>
                  <p className="text-sm text-brown-900/70">No hidden fees or charges</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-3xl bg-[#FFF4EE] p-5 shadow-sm">
                <div className="mt-1 h-10 w-10 rounded-2xl bg-brown-900 text-white grid place-items-center text-sm font-semibold">
                  ⚡
                </div>
                <div>
                  <p className="font-semibold text-brown-950">Quick setup</p>
                  <p className="text-sm text-brown-900/70">5 minutes to complete</p>
                </div>
              </div>
            </div>

            <div className="border-t border-brown-200 pt-8 text-sm text-brown-700/80">
              © 2026 Bandhan Careers. Cultivating professional growth.
            </div>
          </div>
        </section>

        {/* Right Section - Signup Form */}
        <div className="flex w-full max-w-md flex-col items-stretch gap-6 lg:max-w-sm">
          <Card>
            <div className="space-y-8">
              <div className="flex items-center justify-between gap-4 border-b border-brown-100 pb-5">
                <div className="text-sm font-semibold uppercase tracking-[0.28em] text-brown-700/90">
                  Sign Up
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/Jobseeker/login")}
                  className="text-sm font-semibold text-brown-500 transition hover:text-brown-900"
                >
                  Login
                </button>
              </div>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <Input
                    label="Full Name"
                    type="text"
                    placeholder="e.g. Karan Sharma"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <Input
                    label="Confirm Password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <div className="flex items-start gap-2 text-xs text-brown-700">
                  <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 rounded border-brown-200"
                    required
                  />
                  <label htmlFor="terms" className="leading-relaxed">
                    I agree to the{" "}
                    <span className="font-semibold text-brown-900">Terms of Service</span>{" "}
                    and <span className="font-semibold text-brown-900">Privacy Policy</span>
                  </label>
                </div>

                <Button fullWidth disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>

              <div className="flex items-center gap-3 text-sm text-brown-500">
                <span className="h-px flex-1 bg-brown-200" />
                <span>or</span>
                <span className="h-px flex-1 bg-brown-200" />
              </div>

              <Button variant="secondary" fullWidth onClick={() => alert("Google Sign-In will be available soon.")} className="gap-3 px-4 text-sm text-brown-950">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] shadow-sm">
                  G
                </span>
                Continue with Google
              </Button>
            </div>
          </Card>

          <div className="rounded-3xl bg-white/90 p-5 text-center text-sm text-brown-700 shadow-[0_25px_60px_-30px_rgba(0,0,0,0.18)]">
            Already have an account? <span className="font-semibold text-brown-900 cursor-pointer" onClick={() => router.push("/Jobseeker/login")}>Login</span>
          </div>

          <div className="rounded-3xl bg-[#FFF4EE] p-5 text-center text-xs uppercase tracking-[0.28em] text-brown-600">
            join thousands of professionals building their careers
          </div>
        </div>
      </div>
    </div>
  );
}

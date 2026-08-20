"use client";

import Link from "next/link";
import { Button, Field, Input, Logo, Tabs, Alert, Card } from "@bandhan/ui";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useLoginMutation, useRegisterMutation } from "../redux/services/AuthApi";
import { setJobPortalSession } from "@/lib/session";

type ApiErrorShape = {
  data?: {
    message?: string;
  };
};

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [companyName, setCompanyName] = useState("");
  const [companyEmail, setCompanyEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const loading = loginLoading || registerLoading;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!companyEmail || !password || (tab === "signup" && !companyName)) {
      const msg = "All fields are required.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (tab === "signup") {
      if (password.length < 8) {
        const msg = "Password must be at least 8 characters.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!/[A-Z]/.test(password)) {
        const msg = "Password must contain at least 1 uppercase letter.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!/[a-z]/.test(password)) {
        const msg = "Password must contain at least 1 lowercase letter.";
        setError(msg);
        toast.error(msg);
        return;
      }
      if (!/\d/.test(password)) {
        const msg = "Password must contain at least 1 number.";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    try {
      if (tab === "login") {
        const result = await login({ companyEmail, password }).unwrap();
        if (result.token) setJobPortalSession(result.token, result.role === "jobseeker" ? "jobseeker" : "recruiter");
        toast.success("Login successful!");
        const next = new URLSearchParams(window.location.search).get("next");
        const isSeeker = result.role === "jobseeker";
        router.push(next?.startsWith(isSeeker ? "/Jobseeker/" : "/jobposter/") ? next : isSeeker ? "/Jobseeker/dashboard" : "/jobposter/profilesetup");
        return;
      }

      const result = await register({
        companyName,
        companyEmail,
        password,
      }).unwrap();

      if (result.success) {
        toast.success("Account created successfully. Please login to continue.");
        setCompanyName("");
        setCompanyEmail("");
        setPassword("");
        setTab("login");
        setInfo("Account created successfully. Please login to continue.");
        router.push("/jobposter/login");
      }
    } catch (err) {
      const errorMessage =
        typeof err === "object" && err !== null && "data" in err
          ? (err as ApiErrorShape).data?.message || "Unable to connect to server. Check the API URL and network."
          : "Unable to connect to server. Check the API URL and network.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6EEE7] dark:bg-[#1a1a1a] flex flex-col justify-between">

      {/* Main Section */}
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* LEFT */}
        <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:px-24 lg:py-12">

          <h1 className="text-[#7A4B2F] dark:text-[#c9a882] font-medium text-lg">
            Bandhan Careers
          </h1>

          <h2 className="mt-6 text-[52px] leading-15 font-semibold text-[#2D1F16] dark:text-[#ededed]">
            Hire the Right <br /> Talent Faster
          </h2>

          <p className="mt-5 text-[#7E5F49] dark:text-[#b89b7d] max-w-md text-sm leading-6">
            Post jobs, manage applicants, and build your team efficiently with
            our sun-baked, human-centric recruitment platform.
          </p>

          <div className="mt-6">
            <img
              src="/Gradient.png"
              alt="team"
              className="rounded-xl w-105 h-75 object-cover"
            />
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:w-1/2 flex items-center justify-center px-6 md:px-12 py-6">

          <Card className="w-full max-w-md p-5 space-y-6">

            <div className="flex justify-center">
              <Logo href="/jobposter" />
            </div>

            {/* Tabs */}
            <Tabs
              items={[
                { id: "login", label: "Login" },
                { id: "signup", label: "Sign Up" },
              ]}
              active={tab}
              onChange={(id) => setTab(id as "login" | "signup")}
            />

            {/* FORM */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {tab === "signup" && (
                <Field label="Company Name" required>
                  <Input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your company name"
                  />
                </Field>
              )}

              <Field label="Company Email" required>
                <Input
                  type="email"
                  value={companyEmail}
                  autoComplete="email"
                  onChange={(e) => setCompanyEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </Field>

              <Field label="Password" required>
                <div className="flex justify-end">
                <Link href="/jobposter/forgot-password" className="text-xs text-[#B24E2E] dark:text-[#e07050]">
                  Forgot?
                </Link>
              </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete={tab === "login" ? "current-password" : "new-password"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#7A4B2F] dark:text-[#c9a882]"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </Field>

              {error && <Alert tone="danger">{error}</Alert>}
              {info && <Alert tone="success">{info}</Alert>}

              <Button block type="submit" loading={loading}>
                {loading ? "Please wait..." : tab === "login" ? "Continue" : "Create Account"}
              </Button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#E6D8CD] dark:bg-[#374151]" />
                <span className="text-xs text-[#8B6F63] dark:text-[#a89080]">OR</span>
                <div className="flex-1 h-px bg-[#E6D8CD] dark:bg-[#374151]" />
              </div>

              <Button
                type="button"
                variant="secondary"
                block
                onClick={() => alert("Google Sign-In will be available soon.")}
                className="flex items-center justify-center gap-3"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  className="h-5 w-5"
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.72 1.22 9.23 3.6l6.9-6.9C35.64 2.54 30.2 0 24 0 14.82 0 6.78 5.44 2.98 13.32l8.02 6.23C12.94 13.02 17.98 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.1 24.5c0-1.64-.14-3.2-.4-4.7H24v9h12.4c-.54 2.9-2.2 5.36-4.7 7.02l7.3 5.68C43.9 37.5 46.1 31.5 46.1 24.5z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.98 28.55A14.5 14.5 0 0 1 9.5 24c0-1.58.27-3.1.75-4.55l-8.02-6.23A23.97 23.97 0 0 0 0 24c0 3.84.92 7.47 2.23 10.78l8.75-6.23z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.9-2.14 15.87-5.82l-7.3-5.68c-2.02 1.36-4.6 2.17-8.57 2.17-6.02 0-11.06-3.52-12.98-8.55l-8.75 6.23C6.78 42.56 14.82 48 24 48z"
                  />
                </svg>
                Continue with Google
              </Button>

              <p className="text-xs text-[#8B6F63] dark:text-[#a89080] text-center leading-5 mt-3">
                By continuing, you agree to Bandhan Careers' <Link href="/jobposter/terms-of-service" className="text-[#B24E2E] dark:text-[#e07050]">Terms of Service</Link> and <Link href="/jobposter/privacy-policy" className="text-[#B24E2E] dark:text-[#e07050]">Privacy Policy</Link>.
              </p>
            </form>

          </Card>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-[#E6D8CD] dark:border-[#374151] py-6 px-6 md:px-12 text-sm text-[#7E5F49] dark:text-[#b89b7d]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="font-medium text-[#5E2D18] dark:text-[#e0c0a0]">
            Bandhan Careers
          </div>

          <div className="flex flex-wrap gap-6 text-xs">
            <Link href="/jobposter/privacy-policy">Privacy Policy</Link>
            <Link href="/jobposter/terms-of-service">Terms of Service</Link>
            <Link href="/jobposter/cookie-policy">Cookie Policy</Link>
            <Link href="/jobposter/contact-support">Contact Support</Link>
          </div>

          <div className="text-xs text-[#A48871] dark:text-[#8b7060]">
            © 2024 Bandhan Careers. Cultivating human potential.
          </div>
        </div>
      </footer>
    </div>
  );
}
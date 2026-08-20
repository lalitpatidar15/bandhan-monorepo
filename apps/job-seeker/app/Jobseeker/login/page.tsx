"use client";

import { Footer } from "@/components/ui/Footer";
import { Button, Field, Input, Logo, Tabs, Alert, Card } from "@bandhan/ui";
import { Briefcase, Star } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useLoginMutation, useRegisterMutation } from "../redux/services/AuthApi";
import { setJobPortalSession } from "@/lib/session";

type ApiErrorShape = {
  data?: {
    message?: string;
  };
};

export default function Auth() {
  const [activeTab, setActiveTab] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const router = useRouter();
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const isLoading = loginLoading || registerLoading;

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email || !password || (activeTab === "signup" && !fullName)) {
      const msg = "Please fill in all required fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!validateEmail(email)) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (activeTab === "signup") {
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
      if (password !== confirmPassword) {
        const msg = "Passwords do not match.";
        setError(msg);
        toast.error(msg);
        return;
      }
    }

    try {
      if (activeTab === "login") {
        const result = await login({ email, password }).unwrap();
        if (result.token) setJobPortalSession(result.token, result.role === "recruiter" ? "recruiter" : "jobseeker");
        toast.success("Login successful!");
        const next = new URLSearchParams(window.location.search).get("next");
        const isRecruiter = result.role === "recruiter";
        router.push(next?.startsWith(isRecruiter ? "/jobposter/" : "/Jobseeker/") ? next : isRecruiter ? "/jobposter/dashboard" : "/Jobseeker/dashboard");
        return;
      }

      const result = await register({ fullName, email, password }).unwrap();
      toast.success(result.message || "Account created successfully. Please login to continue.");
      setInfo(result.message || "Account created successfully. Please login to continue.");
      setActiveTab("login");
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMessage =
        typeof err === "object" && err !== null && "data" in err
          ? (err as ApiErrorShape).data?.message || "Unable to connect to server."
          : "Unable to connect to server.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };
  return (
    <>
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* ================= LEFT SIDE ================= */}
      <section className="hidden bg-[#FEF1E7] lg:flex lg:justify-center lg:px-12 lg:py-8">
        <div className="max-w-xl space-y-6 mt-4">
          <p className="text-md font-bold uppercase tracking-[0.28em] text-[#7A3F23] text-brown-900/70">
            Bandhan Careers
          </p>

          <h1 className="text-3xl sm:text-6xl  leading-tight text-brown-950">
            Find Your <br /> Next
            <br /> Opportunity
          </h1>

          <p className="text-lg text-brown-900/80">
            Discover jobs that match your skills and grow <br />
            your career with a community that supports your
            <br />
            ambition.
          </p>

          {/* FEATURES */}
          <div className="grid-rows-2  gap-5  sm:grid-cols-2">
            <div className="flex gap-3   rounded-2xl">
              <div className="h-10 w-10 bg-[#9644071A] text-[#7A3F23] grid place-items-center rounded-full">
                <Briefcase size={18} />
              </div>
              <div>
                <p className="font-semibold text-[14px]">
                  10,000+ jobs available
                </p>
                <p className="text-[12px] text-brown-700">
                  Live opportunities updated daily
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5 rounded-2xl">
              <div className="h-10 w-10 bg-[#9644071A] text-[#7A3F23] grid place-items-center rounded-full">
                <Star size={18} />
              </div>
              <div>
                <p className="font-semibold text-[14px]">
                  Trusted by top companies
                </p>
                <p className="text-[12px] text-brown-700">
                  Partnerships with industry leaders
                </p>
              </div>
  </div>
        
        </div>

          {/* AVATARS */}

          <p className="text-gray-600 mt-20 text-[14px]">
            © {new Date().getFullYear()} BANDHAN CAREERS. CULTIVATING PROFESSIONAL GROWTH.
          </p>
       
        </div>
      </section>

      {/* ================= RIGHT SIDE ================= */}
      <section className="bg-[#FFF8F4] flex items-center justify-center px-6 py-6 lg:px-16">
        <div className="w-full max-w-md space-y-6">
          <Card className="p-4">
            <div className="space-y-6">
              <div className="flex justify-center">
                <Logo href="/Jobseeker" />
              </div>

              {/* Tabs */}
              <Tabs
                items={[
                  { id: "login", label: "Login" },
                  { id: "signup", label: "Sign Up" },
                ]}
                active={activeTab}
                onChange={setActiveTab}
              />

              {/* Forms */}
              <form className="space-y-5" onSubmit={handleSubmit}>
                {activeTab === "signup" && (
                  <Field label="Full Name" required>
                    <Input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </Field>
                )}

                <Field label="Email" required>
                  <Input
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </Field>

                <Field label="Password" required>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    autoComplete={activeTab === "login" ? "current-password" : "new-password"}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                  <div className="text-right text-xs mt-1 text-[#7A3F23] cursor-pointer" onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? "Hide password" : "Show password"}
                  </div>
                </Field>

                {activeTab === "signup" && (
                  <Field label="Confirm Password" required>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      autoComplete="new-password"
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                    />
                  </Field>
                )}

                {error && <Alert tone="danger">{error}</Alert>}
                {info && <Alert tone="success">{info}</Alert>}

                <Button block type="submit" loading={isLoading}>
                  {isLoading ? "Please wait..." : activeTab === "login" ? "Continue" : "Create Account"}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-2 text-sm">
                <div className="h-px bg-gray-300 flex-1" />
                or
                <div className="h-px bg-gray-300 flex-1" />
              </div>
              <Button
                variant="secondary"
                block
                onClick={() => alert("Google Sign-In will be available soon.")}
                className="flex items-center justify-center gap-3"
              >
                {/* Google Icon */}
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
            </div>
          </Card>
<div className="space-y-4">

  {/* SWITCH TEXT BOX */}
  <div className="bg-[#FEF1E7] py-4 text-center text-sm text-brown-800 rounded-b-3xl">
    {activeTab === "login" ? (
      <>
        Don’t have an account?{" "}
        <span
          onClick={() => setActiveTab("signup")}
          className="font-semibold cursor-pointer text-brown-900 hover:underline"
        >
          Sign up
        </span>
      </>
    ) : (
      <>
        Already have an account?{" "}
        <span
          onClick={() => setActiveTab("login")}
          className="font-semibold cursor-pointer text-brown-900 hover:underline"
        >
          Login
        </span>
      </>
    )}
  </div>

  {/* AVATAR + TEXT */}
  <div className="flex flex-col items-center gap-3">

    <div className="flex -space-x-2">
      <div className="w-8 h-8 rounded-full bg-[#ECE0D6] border-2 border-white" aria-hidden />
      <div className="w-8 h-8 rounded-full bg-[#EDE6DB] border-2 border-white" aria-hidden />
      <div className="w-8 h-8 rounded-full bg-[#F6F0E8] border-2 border-white" aria-hidden />
      <div className="w-8 h-8 rounded-full bg-[#ECE0D6] text-[#554339] text-xs flex items-center justify-center border-2 border-white">
        +
      </div>
    </div>

    <p className="text-[10px] tracking-[0.25em] uppercase text-brown-600 text-center leading-relaxed">
      Join a network of curated talent and <br />
      forward-thinking enterprises
    </p>
  </div>

</div>

  <p className="text-center text-sm text-[#554339] mt-4">
    Looking to hire?{" "}
    <a
      href="/jobposter/login"
      className="font-semibold text-[#7A3F23] hover:underline"
    >
      Become an Employer
    </a>
  </p>
        </div>
      </section>
      
    </div>
    <Footer />
    <div className="bg-[#FFF8F4] p-5 text-center text-sm h-16 text-brown-800">

    </div>
    </>
    
  );
}
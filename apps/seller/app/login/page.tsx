"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { apiPost } from "@/lib/api";
import { Logo } from "@bandhan/ui";
import { Button } from "@bandhan/ui";
import { Field, Input } from "@bandhan/ui";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [role] = useState<"seller" | "buyer">("seller");

  const [form, setForm] = useState({
    name: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFieldErrors((prev) => ({
      ...prev,
      [name === "name" ? "email" : name]: "",
    }));
    setError(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setFieldErrors({});

  const emailValue = form.name.trim();
  const passwordValue = form.password;

  if (!emailValue) {
    setFieldErrors({ email: "Please enter your email address." });
    return;
  }

  if (!EMAIL_REGEX.test(emailValue)) {
    setFieldErrors({ email: "Please enter a valid email address." });
    return;
  }

  if (!passwordValue) {
    setFieldErrors({ password: "Please enter your password." });
    return;
  }

  if (isLoading) return;
  setIsLoading(true);

  try {
    const response = await apiPost<{
      success?: boolean;
      token?: string;
      message?: string;
      registrationId?: string;
      isProfileIncomplete?: boolean;
      user?: {
        id?: string;
        name?: string;
        fullName?: string;
        email?: string;
        role?: string;
      };
    }>("/auth/login", {
      email: emailValue.toLowerCase(),
      password: passwordValue,
      role,
    });

    const token = response.token;
    const userName = response.user?.fullName || response.user?.name || emailValue;

    if (token) {
      const tokenKey = role === "seller" ? "sellerToken" : "buyerToken";
      localStorage.setItem(tokenKey, token);
      localStorage.setItem("authToken", token);
    }

    if (response.user?.id) {
      localStorage.setItem("userId", response.user.id);
      if (role === "seller") {
        localStorage.setItem("sellerUserId", response.user.id);
      } else {
        localStorage.setItem("buyerUserId", response.user.id);
      }
    }

    if (response.user?.email) {
      localStorage.setItem("userEmail", response.user.email);
      localStorage.setItem("email", response.user.email);
      localStorage.setItem("sellerEmail", response.user.email);
    } else {
      localStorage.setItem("userEmail", emailValue);
      localStorage.setItem("email", emailValue);
      localStorage.setItem("sellerEmail", emailValue);
    }

    localStorage.setItem("userName", userName);

    if (response.isProfileIncomplete && response.registrationId) {
      localStorage.setItem("sellerRegistrationId", response.registrationId);
      router.push(
        `/profile-setup?id=${encodeURIComponent(response.registrationId)}`
      );
      return;
    }

    if (!token) {
      const message = response.message || "Invalid credentials. Please check your email/password.";
      setError(message);
      toast.error(message);
      return;
    }

    toast.success("Login successful!");

    if (role === "seller") {
      router.replace("/sellerDashboard");
    } else {
      router.replace("/buyer/dashboard");
    }
  } catch (err: any) {
    const status = Number(err?.status ?? 0);
    const message = err?.data?.message || err?.message || "Invalid credentials. Please check your email/password.";

    if (status === 401) {
      setError("Invalid credentials. Please check your email/password.");
      toast.error("Invalid credentials. Please check your email/password.");
      return;
    }

    if (status === 400 && err?.data?.isProfileIncomplete) {
      if (err.data.registrationId) {
        localStorage.setItem("sellerRegistrationId", err.data.registrationId);
        router.push(
          `/profile-setup?id=${encodeURIComponent(err.data.registrationId)}`
        );
        return;
      }
    }

    setError(message);
    toast.error(message);
  } finally {
    setIsLoading(false);
  }
};

  const handleGoogleSignIn = () => {
    const googleUserName = "GoogleUser";
    localStorage.setItem("userName", googleUserName);
    router.replace(`/sellerDashboard`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bhn-bg)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bhn-card bhn-card-pad-lg mb-4">
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>

          <div className="text-center mb-6">
            <h1 className="text-[28px] font-extrabold text-[var(--bhn-text)] leading-tight">
              Welcome back!
            </h1>
            <p className="text-[var(--bhn-text-muted)] text-sm mt-2">
              Please enter your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field
              label="Email"
              required
              error={fieldErrors.email}
            >
              <Input
                type="email"
                name="name"
                placeholder="Enter your email"
                value={form.name}
                onChange={handleChange}
                required
                invalid={Boolean(fieldErrors.email)}
              />
            </Field>

            <Field
              label="Password"
              required
              error={fieldErrors.password}
            >
              <Input
                type="password"
                name="password"
                placeholder="••••••••••"
                value={form.password}
                onChange={handleChange}
                required
                invalid={Boolean(fieldErrors.password)}
              />
            </Field>

            {error && (
              <div className="bhn-alert bhn-alert-danger">
                <div>
                  <p className="bhn-alert-body">{error}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-[13px] text-[var(--bhn-text-muted)]">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={handleChange}
                  className="accent-[var(--bhn-brand-600)]"
                />
                Remember me
              </label>

              <button
                type="button"
                className="text-[13px] text-[var(--bhn-brand-700)] hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              block
              size="lg"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-[var(--bhn-border)]" />
              <span className="text-[var(--bhn-text-soft)] text-sm">Or</span>
              <div className="flex-1 h-px bg-[var(--bhn-border)]" />
            </div>

            <Button
              type="button"
              variant="secondary"
              block
              size="lg"
              onClick={handleGoogleSignIn}
              icon={<FcGoogle size={20} />}
            >
              Sign In with Google
            </Button>

            <p className="text-center text-sm text-[var(--bhn-text-muted)] pt-2">
              Don&apos;t have an account?{" "}
              <span
                onClick={() => router.push("/signup")}
                className="text-[var(--bhn-brand-700)] font-medium cursor-pointer hover:underline"
              >
                Sign up
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
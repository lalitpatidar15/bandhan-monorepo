"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button, Field, Input, Logo } from "@bandhan/ui";
import { FcGoogle } from "react-icons/fc";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setCredentials } from "@/store/slices/authSlice";
import { JOB_PORTAL_URL, SELLER_PORTAL_URL, STUDENT_PORTAL_URL } from "@/lib/externalLinks";

type PortalRole = "buyer" | "seller" | "student" | "instructor" | "jobseeker" | "recruiter";

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError(null);
    setSuccess(false);

    if (!form.email.trim() || !form.password.trim()) {
      const msg = "Please fill in all fields.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!form.email.includes("@")) {
      const msg = "Please enter a valid email address.";
      setError(msg);
      toast.error(msg);
      return;
    }

    if (form.password.length < 6) {
      const msg = "Password must be at least 6 characters.";
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      // The API verifies credentials across every customer-facing account type
      // and returns the actual role. A person never needs to select it here.
      const result = await login({ email: form.email.trim(), password: form.password }).unwrap();
      if (!result.token) {
        const msg = "The server did not return a valid session. Please try again.";
        setError(msg);
        toast.error(msg);
        return;
      }

      dispatch(setCredentials({ user: result.user, token: result.token }));
      toast.success("Login successful!");

      setSuccess(true);

      setForm({
        email: "",
        password: "",
        remember: false,
      });

      const authenticatedRole = result.user?.role as PortalRole | undefined;
      const portalUrl = authenticatedRole === "seller" ? SELLER_PORTAL_URL
        : authenticatedRole === "student" || authenticatedRole === "instructor" ? STUDENT_PORTAL_URL
        : authenticatedRole === "jobseeker" || authenticatedRole === "recruiter" ? JOB_PORTAL_URL
        : null;

      if (portalUrl && authenticatedRole) {
        if (!result.ssoCode) throw new Error("Unable to start the secure portal sign-in handoff.");
        const callbackUrl = new URL("/auth/callback", portalUrl);
        callbackUrl.searchParams.set("sso", result.ssoCode);
        callbackUrl.searchParams.set("role", authenticatedRole);
        window.location.assign(callbackUrl.toString());
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");

      const destination = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/signup")
        ? next
        : "/userdashboard/dashboard";
      router.replace(destination);

    } catch (err: unknown) {
      const apiError = err as { data?: { message?: string }; error?: string };
      const msg = apiError.data?.message || apiError.error || "Login failed. Please try again.";
      setError(msg);
      toast.error(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto flex flex-col gap-5"
    >
      {/* Logo */}
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      {/* Heading */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[var(--bhn-text)]">
          Welcome back!
        </h1>

        <p className="text-[var(--bhn-text-muted)] text-sm">
          Sign in once—we’ll take you to the right Bandhan portal.
        </p>
      </div>

      {/* Email */}
      <Field label="Email">
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
      </Field>

      {/* Password */}
      <Field label="Password">
        <Input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
      </Field>

      {/* Options */}
      <div className="flex justify-between items-center text-sm">
        <label className="flex items-center gap-2 text-[var(--bhn-text-muted)]">
          <input
            type="checkbox"
            name="remember"
            checked={form.remember}
            onChange={handleChange}
            className="accent-[var(--bhn-brand-600)]"
          />

          Remember me
        </label>

        <span className="text-[var(--bhn-brand-700)] cursor-pointer hover:underline">
          Forgot password?
        </span>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-sm text-[var(--bhn-error-600)] font-medium">
          {error}
        </p>
      )}

      {/* SUCCESS */}
      {success && (
        <p className="text-sm text-[var(--bhn-success-600)] font-medium">
          ✓ Login successful!
        </p>
      )}

      {/* Button */}
      <Button
        type="submit"
        size="lg"
        block
        disabled={isLoading || success}
        loading={isLoading}
      >
        {success
          ? "Success!"
          : "Sign in"}
      </Button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--bhn-border)]" />

        <span className="text-sm text-[var(--bhn-text-soft)]">
          Or
        </span>

        <div className="flex-1 h-px bg-[var(--bhn-border)]" />
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="secondary"
        block
        onClick={() => setError("Google sign-in is not configured yet.")}
      >
        <FcGoogle size={20} />
        Sign in with Google
      </Button>

      {/* Signup */}
      <p className="text-sm text-center text-[var(--bhn-text-muted)]">
        Don&apos;t have an account?{" "}
        <span
          className="text-[var(--bhn-brand-700)] cursor-pointer hover:underline font-medium"
          onClick={() => router.push("/signup")}
        >
          Sign up
        </span>
      </p>
      <p className="text-sm text-center -mt-3 text-[var(--bhn-text-muted)]">
        Want to sell on Bandhan?{" "}
        <a href="https://product-seller-vert.vercel.app/signup" className="text-[var(--bhn-brand-700)] font-semibold hover:underline">
          Become a Seller
        </a>
      </p>
    </form>
  );
}

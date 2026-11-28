"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { Button, Field, Input, Logo, Spinner } from "@bandhan/ui";
import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { useLoginMutation, useSocialLoginMutation } from "@/store/api/authApi";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setCredentials } from "@/store/slices/authSlice";
import type { AuthResponse } from "@/types/auth";
import { JOB_PORTAL_URL, SELLER_PORTAL_URL, STUDENT_PORTAL_URL } from "@/lib/externalLinks";
import {
  loadFacebookSdk,
  renderGoogleSignInButton,
  requestFacebookToken,
  type SocialTokenRequest,
} from "@/lib/socialAuth";

type PortalRole = "buyer" | "seller" | "student" | "instructor" | "jobseeker" | "recruiter";

const SOCIAL_NOT_CONFIGURED = "Social sign-in is not configured for this deployment";

function getErrorMessage(error: unknown, fallback: string) {
  const apiError = error as { data?: { message?: string } | string; error?: string };
  const dataMessage = typeof apiError?.data === "string" ? apiError.data : apiError?.data?.message;
  return dataMessage || apiError?.error || fallback;
}

export default function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [socialLogin] = useSocialLoginMutation();

  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const facebookAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoadFailed, setGoogleLoadFailed] = useState(false);
  const [facebookReady, setFacebookReady] = useState(false);
  const [facebookLoadFailed, setFacebookLoadFailed] = useState(false);
  const [facebookBusy, setFacebookBusy] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);
  const socialSubmitRef = useRef<(payload: SocialTokenRequest) => Promise<void>>(async () => undefined);

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const applyLoginResult = useCallback((result: AuthResponse) => {
    if (!result.token) {
      const msg = "The server did not return a valid session. Please try again.";
      setError(msg);
      toast.error(msg, { id: "portal-login" });
      return;
    }

    // The API verifies credentials across every customer-facing account type
    // and returns the actual role. A person never needs to select it here.
    const authenticatedRole = result.user?.role as PortalRole | undefined;
    const portalUrl = authenticatedRole === "seller" ? SELLER_PORTAL_URL
      : authenticatedRole === "student" || authenticatedRole === "instructor" ? STUDENT_PORTAL_URL
      : authenticatedRole === "jobseeker" || authenticatedRole === "recruiter" ? JOB_PORTAL_URL
      : null;

    if (portalUrl && authenticatedRole) {
      const callbackUrl = new URL("/auth/callback", portalUrl);
      if (result.ssoCode) {
        callbackUrl.searchParams.set("sso", result.ssoCode);
        callbackUrl.searchParams.set("role", authenticatedRole);
      } else {
        // Compatibility path for an older deployed API that returns a valid
        // session token but not the newer one-time SSO grant. URL fragments
        // are not included in HTTP requests and are cleared by the callback.
        callbackUrl.hash = new URLSearchParams({
          token: result.token,
          role: authenticatedRole,
          name: result.user?.name || "",
        }).toString();
      }
      window.location.assign(callbackUrl.toString());
      return;
    }

    dispatch(setCredentials({ user: result.user, token: result.token }));
    setError(null);
    setSuccess(true);
    setForm({ email: "", password: "", remember: false });
    toast.success("Login successful!", { id: "portal-login" });

    const next = new URLSearchParams(window.location.search).get("next");
    const destination = next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") && !next.startsWith("/signup")
      ? next
      : "/userdashboard/dashboard";
    router.replace(destination);
  }, [dispatch, router]);

  const handleSocialCredential = useCallback(async (payload: SocialTokenRequest) => {
    setError(null);
    setSuccess(false);
    setSocialLoading(true);

    try {
      const result = await socialLogin(payload).unwrap();
      applyLoginResult(result as AuthResponse);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Social sign-in failed. Please try again.");
      setSuccess(false);
      setError(msg);
      toast.error(msg, { id: "portal-login" });
    } finally {
      setSocialLoading(false);
    }
  }, [applyLoginResult, socialLogin]);

  useEffect(() => {
    socialSubmitRef.current = handleSocialCredential;
  }, [handleSocialCredential]);

  useEffect(() => {
    if (!googleClientId || !googleButtonRef.current) return;

    let cancelled = false;
    renderGoogleSignInButton(
      googleButtonRef.current,
      googleClientId,
      (credential) => {
        void socialSubmitRef.current({ provider: "google", token: credential });
      },
    )
      .then(() => {
        if (!cancelled) setGoogleReady(true);
      })
      .catch(() => {
        if (!cancelled) setGoogleLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [googleClientId]);

  useEffect(() => {
    if (!facebookAppId) return;

    let cancelled = false;
    loadFacebookSdk(facebookAppId)
      .then(() => {
        if (!cancelled) setFacebookReady(true);
      })
      .catch(() => {
        if (!cancelled) setFacebookLoadFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [facebookAppId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
      const result = await login({ email: form.email.trim(), password: form.password }).unwrap();
      applyLoginResult(result);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Login failed. Please try again.");
      setSuccess(false);
      setError(msg);
      toast.error(msg, { id: "portal-login" });
    }
  };

  const handleFacebookClick = async () => {
    if (!facebookAppId || !facebookReady || facebookBusy || socialLoading) return;

    setFacebookBusy(true);
    try {
      const payload = await requestFacebookToken(facebookAppId);
      await handleSocialCredential(payload);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Facebook sign-in failed. Please try again.");
      if (msg !== "Facebook sign-in was cancelled.") {
        setError(msg);
        toast.error(msg, { id: "portal-login" });
      }
    } finally {
      setFacebookBusy(false);
    }
  };

  const facebookDisabled = !facebookAppId || !facebookReady || facebookLoadFailed || facebookBusy || socialLoading;
  const facebookTitle = !facebookAppId
    ? SOCIAL_NOT_CONFIGURED
    : facebookLoadFailed
      ? "Facebook sign-in is temporarily unavailable."
      : !facebookReady
        ? "Loading Facebook sign-in…"
        : undefined;

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full mx-auto flex flex-col gap-5"
    >
      <div className="flex justify-center">
        <Logo size="lg" />
      </div>

      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-[var(--bhn-text)]">
          Welcome back!
        </h1>

        <p className="text-[var(--bhn-text-muted)] text-sm">
          Sign in once—we’ll take you to the right Bandhan portal.
        </p>
      </div>

      <Field label="Email">
        <Input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
      </Field>

      <Field label="Password">
        <Input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
      </Field>

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

        <Link href="/forgot-password" className="text-[var(--bhn-brand-700)] hover:underline">
          Forgot password?
        </Link>
      </div>

      {error && (
        <p className="text-sm text-[var(--bhn-error-600)] font-medium">
          {error}
        </p>
      )}

      {success && (
        <p className="text-sm text-[var(--bhn-success-600)] font-medium">
          ✓ Login successful!
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        block
        disabled={isLoading || success || socialLoading}
        loading={isLoading}
      >
        {success
          ? "Success!"
          : "Sign in"}
      </Button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--bhn-border)]" />

        <span className="text-sm text-[var(--bhn-text-soft)]">
          Or
        </span>

        <div className="flex-1 h-px bg-[var(--bhn-border)]" />
      </div>

      {googleClientId ? (
        <div className="relative flex min-h-11 w-full items-center justify-center overflow-hidden">
          <div
            ref={googleButtonRef}
            className={googleReady ? "w-full max-w-full" : "invisible absolute inset-0 w-full"}
          />
          {!googleReady && (googleLoadFailed ? (
            <Button type="button" variant="secondary" block disabled title="Google sign-in is temporarily unavailable.">
              <FcGoogle size={20} />
              Sign in with Google
            </Button>
          ) : (
            <Spinner size="sm" />
          ))}
        </div>
      ) : (
        <Button type="button" variant="secondary" block disabled title={SOCIAL_NOT_CONFIGURED}>
          <FcGoogle size={20} />
          Sign in with Google
        </Button>
      )}

      {!googleClientId && (
        <p className="-mt-3 text-center text-xs text-[var(--bhn-text-soft)]">
          {SOCIAL_NOT_CONFIGURED}
        </p>
      )}

      <Button
        type="button"
        variant="secondary"
        block
        disabled={facebookDisabled}
        loading={facebookBusy || (facebookReady && socialLoading)}
        title={facebookTitle}
        onClick={handleFacebookClick}
      >
        <FaFacebook size={20} className="text-[var(--bhn-brand-600)]" />
        Sign in with Facebook
      </Button>

      {!facebookAppId && (
        <p className="-mt-3 text-center text-xs text-[var(--bhn-text-soft)]">
          {SOCIAL_NOT_CONFIGURED}
        </p>
      )}

      {socialLoading && (
        <p className="-mt-3 text-center text-xs text-[var(--bhn-text-muted)]">
          Completing social sign-in…
        </p>
      )}

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
        <a href={`${SELLER_PORTAL_URL}/signup`} className="text-[var(--bhn-brand-700)] font-semibold hover:underline">
          Become a Seller
        </a>
      </p>
    </form>
  );
}

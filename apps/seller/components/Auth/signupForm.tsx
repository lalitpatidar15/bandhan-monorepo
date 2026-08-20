"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

import { Button, Field, Input, Select, Logo } from "@bandhan/ui";

import { FaFacebook } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

import {
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from "react-icons/ai";

import {
  MdLock,
  MdPerson,
  MdOutlinePhone,
  MdKeyboardArrowDown,
} from "react-icons/md";

import { User } from "lucide-react";

export default function SignupForm({
  setImage,
}: {
  setImage: (img: string) => void;
}) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");

  const [countryCode, setCountryCode] =
    useState("+91");

  const [selectedCountry, setSelectedCountry] =
    useState("🇮🇳");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] = useState<string | null>(
    null
  );
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const [success, setSuccess] = useState(false);

  const countryOptions = [
    {
      flag: "🇮🇳",
      code: "+91",
      country: "India",
    },
    {
      flag: "🇺🇸",
      code: "+1",
      country: "USA",
    },
    {
      flag: "🇬🇧",
      code: "+44",
      country: "United Kingdom",
    },
    {
      flag: "🇦🇪",
      code: "+971",
      country: "UAE",
    },
    {
      flag: "🇨🇦",
      code: "+1",
      country: "Canada",
    },
    {
      flag: "🇦🇺",
      code: "+61",
      country: "Australia",
    },
    {
      flag: "🇨🇳",
      code: "+86",
      country: "China",
    },
    {
      flag: "🇯🇵",
      code: "+81",
      country: "Japan",
    },
    {
      flag: "🇵🇰",
      code: "+92",
      country: "Pakistan",
    },
    {
      flag: "🇧🇩",
      code: "+880",
      country: "Bangladesh",
    },
  ];

  useEffect(() => {
    const images = [
      "/signup1.png",
      "/user1.png",
      "/Password.png",
    ];

    setImage(images[step - 1]);
  }, [step, setImage]);

  const passwordChecks = [
    {
      label: "At least 1 uppercase",
      valid: /[A-Z]/.test(password),
    },
    {
      label: "At least 1 number",
      valid: /\d/.test(password),
    },
    {
      label: "At least 1 special character",
      valid: /[^A-Za-z0-9]/.test(password),
    },
    {
      label: "At least 8 characters",
      valid: password.length >= 8,
    },
  ];

  const steps = [
    {
      title: "Join us today!",
      description:
        "Please enter your details to get started",
    },
    {
      title: "Personal Information",
      description:
        "Provide essential information to proceed.",
    },
    {
      title: "Password Setup",
      description:
        "Set up a secure password to protect your account.",
    },
  ];

  const completedChecks = passwordChecks.filter(
    (check) => check.valid
  ).length;

  const goNext = () => {
    setError(null);
    setFieldErrors({});

    if (step === 1) {
      const errors: Record<string, string> = {};

      if (!email.trim()) {
        errors.email = "Please enter your email address.";
      } else if (!EMAIL_REGEX.test(email.trim())) {
        errors.email = "Please enter a valid email address.";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    if (step === 2) {
      const errors: Record<string, string> = {};

      if (!name.trim()) {
        errors.name = "Full name is required.";
      }

      if (!phone.trim()) {
        errors.phone = "Phone number is required.";
      } else if (!PHONE_REGEX.test(phone.trim())) {
        errors.phone = "Phone number must be 10 digits starting with 6-9.";
      }

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    setStep((current) =>
      Math.min(current + 1, 3)
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setFieldErrors({});

    const errors: Record<string, string> = {};

    if (!password.trim()) {
      errors.password = "Please create a password.";
    } else if (!PASSWORD_REGEX.test(password)) {
      errors.password = "Password must contain 8+ chars, uppercase, number and special character.";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await apiPost<{
        success?: boolean;
        token?: string;
        message?: string;
        id?: string;
        registrationId?: string;
        user?: {
          id?: string;
          fullName?: string;
          name?: string;
        };
      }>("/auth/register", {
        fullName: name.trim(),
        email: email.trim().toLowerCase(),
        username: username.trim(),
        phone: `${countryCode}${phone.trim()}`,
        password,
        confirmPassword,
        role: "seller",
      });

      const registrationId =
        response.registrationId || response.id || (response as any)?._id || response.user?.id;
      const userName =
        response.user?.fullName || response.user?.name || name.trim() || "Seller";

      if (response.token) {
        localStorage.setItem("sellerToken", response.token);
      }

      if (registrationId) {
        localStorage.setItem("sellerRegistrationId", String(registrationId));
        if (!response.user?.id) {
          localStorage.setItem("sellerUserId", String(registrationId));
        }
      }

      if (response.user?.id) {
        localStorage.setItem("sellerUserId", response.user.id);
      }

      localStorage.setItem("userName", userName);

      setSuccess(true);

      setTimeout(() => {
        if (registrationId) {
          router.push(
            `/profile-setup?id=${encodeURIComponent(String(registrationId))}`
          );
        } else {
          router.push("/profile-setup");
        }
      }, 700);
    } catch (error: any) {
      console.error(error);

      setError(
        error?.data?.message || error?.message || "Registration failed. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[430px] mx-auto px-4 sm:px-6 py-6">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Logo size="md" />
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-center text-[22px] font-semibold text-[var(--bhn-text)]">
              {steps[0].title}
            </h2>

            <p className="text-center text-[13px] text-[var(--bhn-text-muted)] mt-1">
              {steps[0].description}
            </p>
          </div>

          <Button
            variant="secondary"
            block
            icon={<FcGoogle size={20} />}
          >
            <span className="text-sm font-medium">
              Sign up with Google
            </span>
          </Button>

          <Button
            variant="secondary"
            block
            icon={<FaFacebook size={20} color="#1877F2" />}
          >
            <span className="text-sm font-medium">
              Sign up with Facebook
            </span>
          </Button>

          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 border-t border-[var(--bhn-border)]" />

            <span className="text-xs text-[var(--bhn-text-soft)]">
              Or
            </span>

            <div className="flex-1 border-t border-[var(--bhn-border)]" />
          </div>

          <Field
            label="Email"
            required
            error={fieldErrors.email}
          >
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
              />

              <Input
                value={email}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => {
                  setEmail(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, email: "" }));
                }}
                placeholder="Email address or username"
                type="email"
                invalid={Boolean(fieldErrors.email)}
                className="pl-11"
              />
            </div>
          </Field>

          {error && (
            <p className="text-sm text-[var(--bhn-error-600)]">
              {error}
            </p>
          )}

          <Button
            onClick={goNext}
            variant="primary"
            block
            size="lg"
          >
            Get started
          </Button>

          <p className="text-center text-sm text-[var(--bhn-text-muted)]">
            Already have an account?{" "}
            <span
              onClick={() =>
                router.push("/login")
              }
              className="text-[var(--bhn-brand-700)] font-semibold cursor-pointer hover:underline"
            >
              Sign in
            </span>
          </p>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-5">
          {/* TOP ICON */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface-3)] flex items-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[var(--bhn-surface)] border border-[var(--bhn-border)] flex items-center justify-center shadow-sm">
                <MdPerson
                  size={18}
                  className="text-[var(--bhn-text-muted)]"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-center text-[24px] font-semibold text-[var(--bhn-text)]">
              {steps[1].title}
            </h2>

            <p className="text-center text-[13px] text-[var(--bhn-text-muted)] mt-1">
              {steps[1].description}
            </p>
          </div>

          <Field
            label="Full Name"
            required
            error={fieldErrors.name}
          >
            <div className="relative">
              <MdPerson
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
              />

              <Input
                value={name}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => {
                  setName(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Name"
                type="text"
                invalid={Boolean(fieldErrors.name)}
                className="pl-11"
              />
            </div>
          </Field>

          <Field label={<>Username <span className="text-[var(--bhn-text-soft)] font-normal">(Optional)</span></>}>
            <div className="relative">
              <User
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
              />

              <Input
                value={username}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) =>
                  setUsername(e.target.value)
                }
                placeholder="Bandhan"
                type="text"
                className="pl-11"
              />
            </div>
          </Field>

          <Field
            label="Phone Number"
            required
            error={fieldErrors.phone}
          >
            <div className="flex gap-2">
              <div className="relative min-w-[120px]">
                <Select
                  value={`${selectedCountry}-${countryCode}`}
                  onChange={(e) => {
                    const [flag, code] =
                      e.target.value.split("-");

                    setSelectedCountry(flag);
                    setCountryCode(code);
                  }}
                  className="appearance-none pr-8 h-[52px] font-medium"
                >
                  {countryOptions.map(
                    (country, index) => (
                      <option
                        key={index}
                        value={`${country.flag}-${country.code}`}
                      >
                        {country.flag}{" "}
                        {country.code}
                      </option>
                    )
                  )}
                </Select>

                <MdKeyboardArrowDown
                  size={20}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)] pointer-events-none"
                />
              </div>

              <div className="relative flex-1">
                <MdOutlinePhone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-soft)]"
                />

                <Input
                  value={phone}
                  onChange={(
                    e: ChangeEvent<HTMLInputElement>
                  ) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    setPhone(digits);
                    setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="12345 67890"
                  type="tel"
                  invalid={Boolean(fieldErrors.phone)}
                  className="pl-11"
                />
              </div>
            </div>
          </Field>

          {error && (
            <p className="text-sm text-[var(--bhn-error-600)]">
              {error}
            </p>
          )}

          <Button
            onClick={goNext}
            variant="primary"
            block
            size="lg"
          >
            Continue
          </Button>

          <p className="text-center text-sm text-[var(--bhn-text-muted)]">
            Want to fill in later?{" "}
            <span
              onClick={() =>
                router.push("/login")
              }
              className="font-semibold cursor-pointer hover:underline text-[var(--bhn-text)]"
            >
              Skip this step
            </span>
          </p>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full border border-[var(--bhn-border)] bg-[var(--bhn-surface-3)] flex items-center justify-center shadow-sm">
              <div className="w-10 h-10 rounded-full bg-[var(--bhn-surface)] border border-[var(--bhn-border)] flex items-center justify-center shadow-sm">
                <MdLock
                  size={20}
                  className="text-[var(--bhn-text-muted)]"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-center text-[24px] font-semibold text-[var(--bhn-text)]">
              {steps[2].title}
            </h2>

            <p className="text-center text-[13px] text-[var(--bhn-text-muted)] mt-1">
              {steps[2].description}
            </p>
          </div>

          <Field
            label="Create a Password"
            required
            error={fieldErrors.password}
          >
            <div className="relative">
              <Input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => {
                  setPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, password: "" }));
                }}
                placeholder="••••••••"
                invalid={Boolean(fieldErrors.password)}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]"
              >
                {showPassword ? (
                  <AiOutlineEyeInvisible
                    size={20}
                  />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </Field>

          <Field
            label="Confirm Password"
            required
            error={fieldErrors.confirmPassword}
          >
            <div className="relative">
              <Input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(
                  e: ChangeEvent<HTMLInputElement>
                ) => {
                  setConfirmPassword(e.target.value);
                  setFieldErrors((prev) => ({ ...prev, confirmPassword: "" }));
                }}
                placeholder="••••••••"
                invalid={Boolean(fieldErrors.confirmPassword)}
                className="pr-12"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--bhn-text-muted)]"
              >
                {showConfirmPassword ? (
                  <AiOutlineEyeInvisible
                    size={20}
                  />
                ) : (
                  <AiOutlineEye size={20} />
                )}
              </button>
            </div>
          </Field>

          {/* PASSWORD STRENGTH */}
          <div className="rounded-2xl border border-[var(--bhn-border)] bg-[var(--bhn-surface)] p-4">
            <div className="text-sm font-semibold text-[var(--bhn-brand-700)] mb-3">
              Password Strength
            </div>

            <div className="h-2 rounded-full bg-[var(--bhn-surface-3)] overflow-hidden mb-4">
              <div
                className="h-full bg-[var(--bhn-brand-600)] transition-all duration-300"
                style={{
                  width: `${
                    (completedChecks /
                      passwordChecks.length) *
                    100
                  }%`,
                }}
              />
            </div>

            <div className="space-y-2">
              {passwordChecks.map((check) => (
                <div
                  key={check.label}
                  className="flex items-center gap-2 text-sm"
                >
                  <span
                    className={`${
                      check.valid
                        ? "text-[var(--bhn-success-600)]"
                        : "text-[var(--bhn-text-soft)]"
                    }`}
                  >
                    ✓
                  </span>

                  <span
                    className={
                      check.valid
                        ? "text-[var(--bhn-text)]"
                        : "text-[var(--bhn-text-muted)]"
                    }
                  >
                    {check.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-[var(--bhn-error-600)]">
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm text-[var(--bhn-success-600)] font-medium">
              ✓ Registration successful!
            </p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isLoading || success}
            variant="primary"
            block
            size="lg"
          >
            {isLoading
              ? "Saving..."
              : success
              ? "Done"
              : "Continue"}
          </Button>
        </div>
      )}
    </div>
  );
}
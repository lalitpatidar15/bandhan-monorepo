"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Field, Input, Logo } from "@bandhan/ui";
import { registrationRoles } from "@bandhan/config";
import toast from "react-hot-toast";
import { usePortalRegisterMutation } from "@/store/api/authApi";

const roleCopy: Record<string, { nameLabel: string; namePlaceholder: string }> = {
  buyer: { nameLabel: "Full name", namePlaceholder: "Your full name" },
  seller: { nameLabel: "Business or owner name", namePlaceholder: "Your business name" },
  student: { nameLabel: "Full name", namePlaceholder: "Your full name" },
  instructor: { nameLabel: "Full name", namePlaceholder: "Your full name" },
  jobseeker: { nameLabel: "Full name", namePlaceholder: "Your full name" },
  recruiter: { nameLabel: "Company name", namePlaceholder: "Your company name" },
};

const displayNames: Record<string, string> = {
  buyer: "Buyer",
  seller: "Seller",
  student: "Student",
  instructor: "Instructor",
  jobseeker: "Job Seeker",
  recruiter: "Recruiter",
};

export default function RoleSignupPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = use(params);
  const router = useRouter();
  const [register, { isLoading }] = usePortalRegisterMutation();

  const roleOption = registrationRoles.find((option) => option.role === role);
  const copy = roleCopy[role];

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!roleOption || !copy) router.replace("/signup");
  }, [roleOption, copy, router]);

  if (!roleOption || !copy) return null;

  const update = (key: keyof typeof formData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = `${copy.nameLabel} is required`;
    }
    if (!formData.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = "Please enter a valid email address";
    }

    const password = formData.password;
    if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters";
    } else if (!/[A-Z]/.test(password)) {
      nextErrors.password = "Password must contain an uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      nextErrors.password = "Password must contain a lowercase letter";
    } else if (!/\d/.test(password)) {
      nextErrors.password = "Password must contain a number";
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      nextErrors.password = "Password must contain a special character";
    }

    if (formData.confirmPassword !== password) {
      nextErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      await register({
        role,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {}),
        password,
      }).unwrap();

      toast.success("Account created. Please sign in.");
      // Registration does not issue a session, so send the user to central login.
      router.replace("/login?registered=true");
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError.data?.message || "Unable to create account. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bhn-bg)] px-4 py-10">
      <section className="my-auto w-full max-w-md">
        <div className="bhn-card bhn-card-pad-lg">
          <div className="mb-6 text-center">
            <Logo size="lg" />
            <h1 className="mt-5 text-2xl font-bold text-[var(--bhn-text)]">
              Create a {displayNames[role] ?? roleOption.title} account
            </h1>
            <p className="mt-1 text-sm text-[var(--bhn-text-muted)]">
              {roleOption.description}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Field label={copy.nameLabel} required error={errors.fullName}>
              <Input
                autoComplete="name"
                placeholder={copy.namePlaceholder}
                value={formData.fullName}
                onChange={(event) => update("fullName", event.target.value)}
                aria-invalid={Boolean(errors.fullName)}
                required
              />
            </Field>

            <Field label="Email address" required error={errors.email}>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(event) => update("email", event.target.value)}
                aria-invalid={Boolean(errors.email)}
                required
              />
            </Field>

            <Field label="Phone number" hint="Optional — used for booking and order updates">
              <Input
                type="tel"
                autoComplete="tel"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={(event) => update("phone", event.target.value)}
              />
            </Field>

            <Field
              label="Password"
              required
              hint="8+ characters with uppercase, lowercase, a number and a special character"
              error={errors.password}
            >
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(event) => update("password", event.target.value)}
                aria-invalid={Boolean(errors.password)}
                required
              />
            </Field>

            <Field label="Confirm password" required error={errors.confirmPassword}>
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(event) => update("confirmPassword", event.target.value)}
                aria-invalid={Boolean(errors.confirmPassword)}
                required
              />
            </Field>

            <Button type="submit" size="lg" block disabled={isLoading} loading={isLoading}>
              {isLoading ? "Creating account…" : `Create ${displayNames[role] ?? "account"} account`}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-sm text-[var(--bhn-text-muted)]">
          <Link href="/signup" className="font-semibold text-[var(--bhn-brand-700)] hover:underline">
            Choose a different role
          </Link>
          <span aria-hidden="true"> · </span>
          <Link href="/login" className="font-semibold text-[var(--bhn-brand-700)] hover:underline">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}

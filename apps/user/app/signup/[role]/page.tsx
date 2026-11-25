"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { Button, Field, Input } from "@bandhan/ui";
import { usePortalRegisterMutation } from "@/store/api/authApi";

type RoleRegistration = {
  role: string;
  title: string;
  description: string;
};

const roleOptions: RoleRegistration[] = [
  { role: "buyer", title: "Buyer", description: "Shop products and services for events" },
  { role: "seller", title: "Seller", description: "Sell products and services on the platform" },
  { role: "student", title: "Student", description: "Learn and take courses" },
  { role: "instructor", title: "Instructor", description: "Teach courses and earn" },
  { role: "jobseeker", title: "Job Seeker", description: "Find jobs and build career" },
  { role: "recruiter", title: "Recruiter", description: "Hire talent and manage recruiting" },
];

export default function RoleSignupPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const { role } = use(params);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [register] = usePortalRegisterMutation();

  const routeMap: Record<string, string> = {
    buyer: "/userdashboard",
    seller: "/seller/dashboard",
    student: "/student/courses",
    instructor: "/instructor/dashboard",
    jobseeker: "/job-seeker/dashboard",
    recruiter: "/recruiter/dashboard",
  };

  const roleOption = roleOptions.find((r) => r.role === role);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Name is required";
    }
    if (!formData.email?.trim()) {
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

    if (Object.keys(newErrors).length > 0) return;

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        portalRole: role,
      }).unwrap();

      toast.success("Account created successfully!");

      const targetRoute = routeMap[role];
      if (targetRoute) {
        router.replace(targetRoute);
      } else {
        router.replace("/userdashboard");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[var(--bhn-bg)] px-4 py-12 sm:py-16">
      <section className="mx-auto max-w-4xl">
        <div className="mb-6 text-center">
          <Image
            src="/Group1.png"
            alt="Bandhan Events Hub"
            width={433}
            height={96}
            className="mx-auto h-12 w-auto rounded-lg bg-[var(--bhn-brand-900)] px-3 py-1.5 priority"
          />
          <h1 className="mt-4 text-2xl font-bold text-[var(--bhn-text)]">
            {roleOption?.title} Registration
          </h1>
          <p className="mt-2 text-[var(--bhn-text-muted)]">
            {roleOption?.description}
          </p>
        </div>

        <div className="bg-[var(--bhn-surface)] rounded-2xl p-8 sm:p-10 max-w-md w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Full Name" required error={errors.name}>
              <Input
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Field>
            <Field label="Email Address" required error={errors.email}>
              <Input
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Field>
            <Field label="Password" required error={errors.password}>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </Field>
            <Field label="Confirm Password" required error={errors.confirmPassword}>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                required
              />
            </Field>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating Account..." : "Create Account"}
            </Button>

            <p className="mt-4 text-center text-sm text-[var(--bhn-text-muted)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[var(--bhn-brand-700)] hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
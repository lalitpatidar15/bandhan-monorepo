"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { Button, Field, Input, Logo } from "@bandhan/ui";
import { usePortalRegisterMutation } from "@/store/api/authApi";
import { registrationRoles } from "@bandhan/config";

const nameLabels = { buyer: "Full name", seller: "Business or owner name", student: "Full name", instructor: "Full name", jobseeker: "Full name", recruiter: "Company name" } as const;
type RegistrationRole = keyof typeof nameLabels;

export default function RoleSignupPage() {
  const router = useRouter();
  const params = useParams<{ role: string }>();
  const role = params.role as RegistrationRole;
  const roleOption = registrationRoles.find((option) => option.role === role);
  const config = roleOption ? { label: roleOption.title, nameLabel: nameLabels[role] } : null;
  const [register, { isLoading }] = usePortalRegisterMutation();
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirmPassword: "" });

  if (!config) { router.replace("/signup"); return null; }
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Passwords do not match.");
    try {
      await register({ role, fullName: form.fullName.trim(), email: form.email.trim(), phone: form.phone.trim(), password: form.password }).unwrap();
      toast.success("Account created. Please sign in.");
      router.replace("/login?registered=true");
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string } };
      toast.error(apiError.data?.message || "Unable to create account.");
    }
  };

  return <main className="flex min-h-screen items-center justify-center bg-[var(--bhn-bg)] p-4"><form onSubmit={submit} className="bhn-card bhn-card-pad-lg w-full max-w-md space-y-5"><div className="text-center"><Logo size="lg" /><h1 className="mt-5 text-2xl font-bold text-[var(--bhn-text)]">Create a {config.label} account</h1><p className="mt-1 text-sm text-[var(--bhn-text-muted)]">You can complete portal details after signing in.</p></div><Field label={config.nameLabel}><Input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder={config.nameLabel} /></Field><Field label="Email"><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></Field><Field label="Phone (optional)"><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" /></Field><Field label="Password"><Input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 8 characters" /></Field><Field label="Confirm password"><Input required type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" /></Field><Button type="submit" disabled={isLoading} className="w-full">{isLoading ? "Creating account…" : `Create ${config.label} account`}</Button><p className="text-center text-sm text-[var(--bhn-text-muted)]"><Link href="/signup" className="font-semibold text-[var(--bhn-brand-700)] hover:underline">Choose a different role</Link></p></form></main>;
}

"use client";

import { FormEvent, useState } from "react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/store/api/userApi";
import { SectionHeader, Field, Input, Textarea, Button, EmptyState } from "@bandhan/ui";

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
}

function ProfileEditor({ initialForm }: { initialForm: ProfileFormData }) {
  const [updateProfile, { isLoading: isSaving }] = useUpdateUserProfileMutation();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await updateProfile(form).unwrap();
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Unable to update your profile. Please try again.");
    }
  };

  return (
    <form onSubmit={submit} className="mt-5 space-y-6">
      <Field label="Full name" required>
        <Input
          required
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label="Email" required>
        <Input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </Field>
      <Field label="Phone">
        <Input
          value={form.phone}
          onChange={(event) => setForm({ ...form, phone: event.target.value })}
        />
      </Field>
      <Field label="Address">
        <Textarea
          value={form.address}
          onChange={(event) => setForm({ ...form, address: event.target.value })}
          rows={3}
        />
      </Field>
      <div className="flex items-center gap-4 pt-4 border-t border-[var(--bhn-border)]">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving…" : "Save changes"}
        </Button>
        {message && <p className="text-sm text-[var(--bhn-brand-600)]">{message}</p>}
      </div>
    </form>
  );
}

export default function ProfilePage() {
  const { data, isLoading } = useGetUserProfileQuery();
  const user = data?.user;
  const initialForm: ProfileFormData = {
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl">
        <SectionHeader
          title="Account Settings"
          subtitle="Manage your personal details."
        />
        {isLoading ? (
          <EmptyState title="Loading profile…" />
        ) : (
          <ProfileEditor key={`${initialForm.email}:${initialForm.phone}`} initialForm={initialForm} />
        )}
      </div>
    </DashboardLayout>
  );
}
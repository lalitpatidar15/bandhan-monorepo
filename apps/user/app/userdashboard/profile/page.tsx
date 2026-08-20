"use client";

import { FormEvent, useState } from "react";
import DashboardLayout from "@/components/userDashboard/Dashboardlayout";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "@/store/api/userApi";

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
    <form onSubmit={submit} className="mt-5 space-y-4 rounded-xl border border-[#E7E1D8] bg-white p-6">
      <label className="block text-sm font-medium">
        Full name
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="block text-sm font-medium">
        Email
        <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="block text-sm font-medium">
        Phone
        <input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-1 w-full rounded-lg border p-3" />
      </label>
      <label className="block text-sm font-medium">
        Address
        <textarea value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} className="mt-1 w-full rounded-lg border p-3" rows={3} />
      </label>
      <button disabled={isSaving} className="rounded-lg bg-[#924C2B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {isSaving ? "Saving…" : "Save changes"}
      </button>
      {message ? <p className="text-sm text-[#924C2B]">{message}</p> : null}
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
        <h1 className="text-2xl font-bold text-[#1C1A16]">Account Settings</h1>
        <p className="mt-1 text-sm text-[#6B625A]">Manage your personal details.</p>
        {isLoading ? (
          <div className="mt-5 rounded-xl border border-[#E7E1D8] bg-white p-6">Loading profile…</div>
        ) : (
          <ProfileEditor key={`${initialForm.email}:${initialForm.phone}`} initialForm={initialForm} />
        )}
      </div>
    </DashboardLayout>
  );
}

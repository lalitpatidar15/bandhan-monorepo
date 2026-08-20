"use client";

import { FormEvent, useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import { apiDelete, apiGet, apiPost } from "@/lib/api";

type Venue = { _id: string; name: string; location: string; pricePerDay: number; status?: string; images?: string[] };
const emptyVenue = { name: "", location: "", description: "", pricePerDay: "", guests: "", facilities: "", imageUrls: "" };

export default function SellerVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [form, setForm] = useState(emptyVenue);
  const [message, setMessage] = useState("");
  const load = async () => {
    try { const result = await apiGet<{ data?: Venue[] }>("/venues/seller"); setVenues(result.data || []); }
    catch { setMessage("Unable to load your venues."); }
  };
  useEffect(() => { load(); }, []);
  const create = async (event: FormEvent) => {
    event.preventDefault(); setMessage("");
    try {
      await apiPost("/venues/create", {
        name: form.name, location: form.location, description: form.description,
        pricePerDay: Number(form.pricePerDay), guests: Number(form.guests || 0),
        facilities: JSON.stringify(form.facilities.split(",").map((item) => item.trim()).filter(Boolean)),
        images: form.imageUrls.split(",").map((url) => url.trim()).filter(Boolean),
      });
      setForm(emptyVenue); setMessage("Venue saved as a draft for admin approval."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save venue."); }
  };
  const remove = async (id: string) => {
    if (!window.confirm("Delete this venue?")) return;
    await apiDelete(`/venues/${id}`); await load();
  };
  return <div className="flex min-h-screen bg-[#F7F3EF]"><Sidebar /><main className="flex-1 p-6 sm:p-10">
    <h1 className="font-serif text-3xl text-[#2D221C]">My Venues</h1><p className="mt-1 text-sm text-[#6B625A]">Create venues, manage facilities, spaces, packages, and availability.</p>
    <div className="mt-6 grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><form onSubmit={create} className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
      <h2 className="font-semibold">Add venue</h2>{(["name", "location", "pricePerDay", "guests", "imageUrls"] as const).map((field) => <input key={field} required={field !== "guests"} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} placeholder={field === "imageUrls" ? "At least 4 image URLs, comma separated" : field === "pricePerDay" ? "Price per day" : field === "guests" ? "Maximum guests" : field[0].toUpperCase() + field.slice(1)} className="w-full rounded-lg border p-3 text-sm" />)}
      <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Venue description" className="w-full rounded-lg border p-3 text-sm" />
      <input value={form.facilities} onChange={(e) => setForm({ ...form, facilities: e.target.value })} placeholder="Facilities, comma separated" className="w-full rounded-lg border p-3 text-sm" />
      <button className="rounded-lg bg-[#8B4A20] px-4 py-2 text-sm font-semibold text-white">Save venue</button>{message && <p className="text-sm text-[#8B4A20]">{message}</p>}
    </form><section className="space-y-3">{venues.length ? venues.map((venue) => <article key={venue._id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm"><div><p className="font-semibold">{venue.name}</p><p className="text-sm text-[#6B625A]">{venue.location} · ₹{Number(venue.pricePerDay || 0).toLocaleString("en-IN")}/day</p></div><button onClick={() => remove(venue._id)} className="text-sm font-medium text-red-600">Delete</button></article>) : <p className="rounded-2xl bg-white p-6 text-sm text-[#6B625A]">No venue listings yet.</p>}</section></div>
  </main></div>;
}

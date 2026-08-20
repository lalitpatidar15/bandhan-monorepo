'use client';

import { useMemo, useState } from 'react';
import { Edit, Plus, Search, Trash2 } from 'lucide-react';
import { type AdminVenue, useCreateVenueMutation, useDeleteVenueMutation, useGetVenuesQuery, useUpdateVenueMutation } from '@/lib/adminApi';

const empty = { name: '', location: '', description: '', pricePerDay: '', serviceFee: '', guests: '', rating: '', reviews: '', images: '' };

export default function Venues() {
  const [search, setSearch] = useState(''); const [form, setForm] = useState(empty); const [editingId, setEditingId] = useState<string | null>(null); const [showForm, setShowForm] = useState(false);
  const { data: venues = [] } = useGetVenuesQuery(); const [createVenue, { isLoading: creating }] = useCreateVenueMutation(); const [updateVenue, { isLoading: updating }] = useUpdateVenueMutation(); const [deleteVenue] = useDeleteVenueMutation();
  const filtered = useMemo(() => venues.filter((v) => `${v.name} ${v.location}`.toLowerCase().includes(search.toLowerCase())), [venues, search]);
  const reset = () => { setForm(empty); setEditingId(null); setShowForm(false); };
  const edit = (v: AdminVenue) => { setForm({ name: v.name, location: v.location, description: v.description, pricePerDay: String(v.pricePerDay), serviceFee: String(v.serviceFee), guests: String(v.guests), rating: String(v.rating), reviews: String(v.reviews), images: v.images.join(', ') }); setEditingId(v._id); setShowForm(true); };
  const save = async () => {
    if (!form.name.trim() || !form.location.trim()) return;
    const body = { name: form.name.trim(), location: form.location.trim(), description: form.description.trim(), pricePerDay: Number(form.pricePerDay) || 0, serviceFee: Number(form.serviceFee) || 0, guests: Number(form.guests) || 0, rating: Number(form.rating) || 0, reviews: Number(form.reviews) || 0, images: form.images.split(',').map((x) => x.trim()).filter(Boolean) };
    if (body.images.length < 4) { alert('At least four image URLs are required.'); return; }
    try { if (editingId) await updateVenue({ id: editingId, ...body }).unwrap(); else await createVenue(body).unwrap(); reset(); } catch (error) { console.error(error); }
  };
  return <div>
    <div className="mb-4 flex items-center justify-between"><h1 className="admin-page-heading">Venue Management</h1><button className="admin-btn admin-btn-primary" onClick={() => setShowForm(true)}><Plus className="h-3.5 w-3.5" />Add Venue</button></div>
    {showForm && <div className="card mb-4 space-y-3"><div className="flex justify-between"><h2 className="text-sm font-semibold">{editingId ? 'Edit Venue' : 'Add Venue'}</h2><button className="admin-btn admin-btn-secondary" onClick={reset}>Cancel</button></div><div className="grid grid-cols-1 gap-3 md:grid-cols-2">{(['name', 'location', 'pricePerDay', 'serviceFee', 'guests', 'rating', 'reviews', 'images', 'description'] as const).map((key) => <input key={key} className="admin-input" type={['pricePerDay', 'serviceFee', 'guests', 'rating', 'reviews'].includes(key) ? 'number' : 'text'} placeholder={key === 'images' ? 'Image URLs (comma-separated)' : key.replace(/([A-Z])/g, ' $1')} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />)}</div><button disabled={creating || updating} onClick={save} className="admin-btn admin-btn-primary">{creating || updating ? 'Saving...' : editingId ? 'Save Changes' : 'Create Venue'}</button></div>}
    <div className="card mb-3 flex items-center"><Search className="mr-2 h-4 w-4 text-gray-400" /><input className="flex-1 outline-none" placeholder="Search venues..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
    <div className="card overflow-x-auto"><table className="admin-table w-full"><thead><tr><th>Venue</th><th>Location</th><th>Price/day</th><th>Guests</th><th>Actions</th></tr></thead><tbody>{filtered.map((v) => <tr key={v._id}><td className="text-sm font-medium">{v.name}</td><td>{v.location}</td><td>₹{v.pricePerDay.toLocaleString()}</td><td>{v.guests || '—'}</td><td><div className="flex gap-1"><button className="admin-btn admin-btn-secondary" onClick={() => edit(v)}><Edit className="h-3 w-3" /></button><button className="admin-btn admin-btn-danger" onClick={() => { if (confirm('Delete this venue?')) deleteVenue(v._id); }}><Trash2 className="h-3 w-3" /></button></div></td></tr>)}</tbody></table></div>
  </div>;
}

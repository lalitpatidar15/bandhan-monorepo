'use client';

import { useState } from 'react';
import { MapPin, Plus } from 'lucide-react';
import DashboardLayout from '@/components/userDashboard/Dashboardlayout';
import { Button } from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/store/api/customerApi';

interface Address {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pincode: string;
  label: string;
  isDefault: boolean;
}

const EMPTY: Omit<Address, 'id'> = {
  fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', label: 'Home', isDefault: false,
};

export default function AddressesPage() {
  const { data, isLoading } = useGetAddressesQuery();
  const [createAddress, { isLoading: saving }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [form, setForm] = useState<Omit<Address, 'id'> | null>(null);

  const addresses: Address[] = (data?.addresses || []).map((a) => ({
    id: a._id,
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2,
    city: a.city,
    state: a.state,
    pincode: a.pincode,
    label: a.label,
    isDefault: a.isDefault,
  }));

  const save = async () => {
    if (!form) return;
    try {
      await createAddress({
        fullName: form.fullName,
        phone: form.phone,
        line1: form.line1,
        line2: form.line2,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        label: form.label,
        isDefault: form.isDefault,
      }).unwrap();
      setForm(null);
    } catch {
      /* ignore */
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteAddress(id).unwrap();
    } catch {
      /* ignore */
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1C1A16]">Saved Addresses</h1>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setForm(EMPTY)}>
            Add address
          </Button>
        </div>

        {isLoading ? (
          <p className="mt-8 text-gray-500">Loading…</p>
        ) : form ? (
          <div className="surface mt-4 space-y-3 p-4">
            <Input label="Full name" value={form.fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, fullName: e.target.value })} />
            <Input label="Mobile" value={form.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, phone: e.target.value })} />
            <Input label="Address line 1" value={form.line1} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, line1: e.target.value })} />
            <Input label="Landmark" value={form.line2} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, line2: e.target.value })} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="City" value={form.city} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, city: e.target.value })} />
              <Input label="State" value={form.state} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, state: e.target.value })} />
              <Input label="Pincode" value={form.pincode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
              Set as default
            </label>
            <div className="flex gap-2">
              <Button variant="primary" loading={saving} onClick={save}>Save address</Button>
              <Button variant="outline" onClick={() => setForm(null)}>Cancel</Button>
            </div>
          </div>
        ) : addresses.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-[#E7E1D8] bg-white p-10 text-center">
            <MapPin className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-gray-500">No saved addresses yet.</p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {addresses.map((a) => (
              <div key={a.id} className="surface flex items-start justify-between p-4">
                <div>
                  <p className="font-semibold text-[#1C1A16]">
                    {a.fullName} {a.isDefault && <span className="ml-2 rounded-full bg-[#FAF1EA] px-2 py-0.5 text-[10px] text-[#924C2B]">Default</span>}
                  </p>
                  <p className="text-sm text-gray-600">{a.line1}, {a.line2}</p>
                  <p className="text-xs text-gray-400">{a.city}, {a.state} - {a.pincode}</p>
                </div>
                <button onClick={() => remove(a.id)} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

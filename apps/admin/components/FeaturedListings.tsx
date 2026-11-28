'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button, Input, PageHeader, Select, Field } from '@bandhan/ui';
import { type FeaturedItemType, useGetFeaturedListingsQuery, useUpdateFeaturedListingMutation } from '@/lib/adminApi';

export default function FeaturedListings() {
  const { data, isLoading, isError, refetch } = useGetFeaturedListingsQuery();
  const [updateFeaturedListing, { isLoading: isUpdating }] = useUpdateFeaturedListingMutation();
  const [itemType, setItemType] = useState<FeaturedItemType>('product');
  const [itemId, setItemId] = useState('');

  const products = data?.products || [];
  const jobs = data?.jobs || [];
  const courses = data?.courses || [];
  const services = data?.services || [];
  const venues = data?.venues || [];

  const toggle = async (id: string, type: FeaturedItemType, isFeatured: boolean): Promise<boolean> => {
    if (!id) return false;
    try {
      await updateFeaturedListing({ id, itemType: type, isFeatured }).unwrap();
      toast.success(isFeatured ? 'Listing approved as featured' : 'Listing unapproved');
      return true;
    } catch {
      toast.error('Could not update featured status');
      return false;
    }
  };

  const approveById = async () => {
    if (!itemId.trim()) {
      toast.error('Enter a listing ID');
      return;
    }
    if (await toggle(itemId.trim(), itemType, true)) setItemId('');
  };

  const featuredCard = (item: { _id: string; title?: string; isFeatured?: boolean }, type: FeaturedItemType) => (
    <div key={item._id} className="rounded-lg border border-[var(--bhn-border)] p-3">
      <div className="font-medium text-[var(--bhn-text)]">{item.title || item._id}</div>
      <div className="mt-2 flex justify-end">
        <Button
          size="sm"
          variant={item.isFeatured === false ? 'primary' : 'secondary'}
          disabled={isUpdating}
          onClick={() => toggle(item._id, type, item.isFeatured === false)}
        >
          {item.isFeatured === false ? 'Approve' : 'Unapprove'}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Featured Listings" subtitle="Current featured inventory across products, jobs, and courses." />

      <div className="card mb-4">
        <h2 className="mb-3 text-sm font-semibold">Approve a listing</h2>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <Field label="Item type" className="md:w-48">
            <Select value={itemType} onChange={(event) => setItemType(event.target.value as FeaturedItemType)}>
              <option value="product">Product</option>
              <option value="service">Service</option>
              <option value="venue">Venue</option>
            </Select>
          </Field>
          <Field label="Listing ID" className="flex-1">
            <Input value={itemId} onChange={(event) => setItemId(event.target.value)} placeholder="Paste the listing ID" />
          </Field>
          <Button onClick={approveById} disabled={isUpdating}>Approve</Button>
        </div>
      </div>

      {isError ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-error-600)]">
          Could not load featured listings. <button type="button" className="underline" onClick={() => refetch()}>Retry</button>
        </div>
      ) : isLoading ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading featured listings...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          <section className="card">
            <h2 className="mb-4 text-lg font-semibold">Products ({products.length})</h2>
            <div className="space-y-3">
              {products.length === 0 ? <p className="text-xs text-[var(--bhn-text-muted)]">No featured products.</p> : products.map((item) => featuredCard(item, 'product'))}
            </div>
          </section>

          <section className="card">
            <h2 className="mb-4 text-lg font-semibold">Jobs ({jobs.length})</h2>
            <div className="space-y-3">
              {jobs.length === 0 ? <p className="text-xs text-[var(--bhn-text-muted)]">No featured jobs.</p> : jobs.map((item) => (
                <div key={item._id} className="rounded-lg border border-[var(--bhn-border)] p-3">
                  <div className="font-medium text-[var(--bhn-text)]">{item.jobTitle}</div>
                  <div className="text-xs text-[var(--bhn-text-muted)]">{item.jobCategory}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h2 className="mb-4 text-lg font-semibold">Courses ({courses.length})</h2>
            <div className="space-y-3">
              {courses.length === 0 ? <p className="text-xs text-[var(--bhn-text-muted)]">No featured courses.</p> : courses.map((item) => (
                <div key={item._id} className="rounded-lg border border-[var(--bhn-border)] p-3">
                  <div className="font-medium text-[var(--bhn-text)]">{item.title}</div>
                  <div className="text-xs text-[var(--bhn-text-muted)]">{item.category}</div>
                </div>
              ))}
            </div>
          </section>

          {services.length > 0 ? (
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold">Services ({services.length})</h2>
              <div className="space-y-3">{services.map((item) => featuredCard(item, 'service'))}</div>
            </section>
          ) : null}

          {venues.length > 0 ? (
            <section className="card">
              <h2 className="mb-4 text-lg font-semibold">Venues ({venues.length})</h2>
              <div className="space-y-3">{venues.map((item) => featuredCard(item, 'venue'))}</div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}

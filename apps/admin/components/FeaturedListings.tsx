'use client';

import { useGetFeaturedListingsQuery } from '@/lib/adminApi';

export default function FeaturedListings() {
  const { data } = useGetFeaturedListingsQuery();

  const products = data?.products || [];
  const jobs = data?.jobs || [];
  const courses = data?.courses || [];

  return (
    <div>
      <div className="mb-4">
        <h1 className="admin-page-heading">Featured Listings</h1>
        <p className="admin-page-sub">Current featured inventory across products, jobs, and courses.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Products ({products.length})</h2>
          <div className="space-y-3">
            {products.map((item) => (
              <div key={item._id} className="rounded-lg border border-[var(--bhn-border)] p-3">
                <div className="font-medium text-[var(--bhn-text)]">{item.title}</div>
                <div className="text-xs text-[var(--bhn-text-muted)]">{item.category}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <h2 className="mb-4 text-lg font-semibold">Jobs ({jobs.length})</h2>
          <div className="space-y-3">
            {jobs.map((item) => (
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
            {courses.map((item) => (
              <div key={item._id} className="rounded-lg border border-[var(--bhn-border)] p-3">
                <div className="font-medium text-[var(--bhn-text)]">{item.title}</div>
                <div className="text-xs text-[var(--bhn-text-muted)]">{item.category}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

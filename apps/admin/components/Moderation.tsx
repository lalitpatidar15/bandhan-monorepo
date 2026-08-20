'use client';

import { useState } from 'react';
import {
  useDeleteContentModerationPostMutation,
  useGetContentModerationPostsQuery,
  useGetModerationJobsQuery,
  useGetModerationProductsQuery,
  useUpdateModerationJobMutation,
  useUpdateModerationProductMutation,
} from '@/lib/adminApi';
import { Tabs, Badge, statusTone, Button, PageHeader, EmptyState } from '@bandhan/ui';

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'closed', label: 'Closed' },
  { id: 'draft', label: 'Draft' },
  { id: 'rejected', label: 'Rejected' },
];

export default function Moderation() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'products' | 'content'>('jobs');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: jobs = [] } = useGetModerationJobsQuery();
  const { data: products = [] } = useGetModerationProductsQuery();
  const { data: posts = [] } = useGetContentModerationPostsQuery();
  const [updateJob, { isLoading }] = useUpdateModerationJobMutation();
  const [updateProduct, { isLoading: isUpdatingProduct }] = useUpdateModerationProductMutation();
  const [deletePost, { isLoading: isDeletingPost }] = useDeleteContentModerationPostMutation();
  const [pendingId, setPendingId] = useState<string>('');

  const filteredJobs = statusFilter === 'all' ? jobs : jobs.filter((job) => job.status.toLowerCase() === statusFilter);
  const filteredProducts = statusFilter === 'all' ? products : products.filter((product) => product.status.toLowerCase() === statusFilter);

  const handleStatus = async (id: string, status: string) => {
    setPendingId(id);
    try {
      await updateJob({ id, status }).unwrap();
    } catch (error) {
      console.error('Unable to update moderation status:', error);
    } finally {
      setPendingId('');
    }
  };

  const toggleFeatured = async (id: string, isFeatured: boolean) => {
    setPendingId(id);
    try {
      await updateJob({ id, isFeatured: !isFeatured, featuredPlan: !isFeatured ? 'Featured' : '' }).unwrap();
    } catch (error) {
      console.error('Unable to update featured state:', error);
    } finally {
      setPendingId('');
    }
  };

  const moderateProduct = async (id: string, payload: { status?: string; isFeatured?: boolean }) => {
    setPendingId(id);
    try {
      await updateProduct({ id, ...payload }).unwrap();
    } catch (error) {
      console.error('Unable to update product moderation status:', error);
    } finally {
      setPendingId('');
    }
  };

  const removePost = async (id: string) => {
    setPendingId(id);
    try {
      await deletePost(id).unwrap();
    } catch (error) {
      console.error('Unable to remove post:', error);
    } finally {
      setPendingId('');
    }
  };

  const filterChips = (
    <div className="mb-4 flex flex-wrap gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`bhn-chip ${statusFilter === option.id ? 'bhn-chip-active' : ''}`}
          onClick={() => setStatusFilter(option.id)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Moderation Center"
        subtitle="Review jobs, products, and community content from one place."
      />

      <Tabs
        className="mb-4"
        items={[
          { id: 'jobs', label: 'Jobs' },
          { id: 'products', label: 'Products' },
          { id: 'content', label: 'Community Content' },
        ]}
        active={activeTab}
        onChange={(id) => setActiveTab(id as 'jobs' | 'products' | 'content')}
      />

      {activeTab !== 'content' && filterChips}

      {activeTab === 'jobs' && (
        filteredJobs.length === 0 ? (
          <EmptyState title="No jobs to review" description="Try a different status filter." />
        ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Recruiter</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => {
                const isPending = isLoading && pendingId === job.id;
                return (
                  <tr key={job.id}>
                    <td>
                      <div className="font-medium">{job.title}</div>
                      <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{job.category}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--bhn-text)' }}>{job.recruiterName}</div>
                      <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{job.recruiterEmail}</div>
                    </td>
                    <td>
                      <Badge tone={statusTone(job.status)}>{job.status}</Badge>
                    </td>
                    <td>
                      <Button
                        variant={job.isFeatured ? 'soft' : 'secondary'}
                        size="sm"
                        onClick={() => toggleFeatured(job.id, job.isFeatured)}
                        disabled={isPending}
                      >
                        {job.isFeatured ? 'Featured' : 'Not Featured'}
                      </Button>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <Button variant="primary" size="sm" onClick={() => handleStatus(job.id, 'active')} disabled={isPending}>Approve</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleStatus(job.id, 'closed')} disabled={isPending}>Close</Button>
                        <Button variant="secondary" size="sm" onClick={() => handleStatus(job.id, 'draft')} disabled={isPending}>Draft</Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )
      )}

      {activeTab === 'products' && (
        filteredProducts.length === 0 ? (
          <EmptyState title="No products to review" description="Try a different status filter." />
        ) : (
        <div className="bhn-table-wrap">
          <table className="bhn-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const isPending = isUpdatingProduct && pendingId === product.id;
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="font-medium">{product.title}</div>
                      <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{product.category}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--bhn-text)' }}>{product.sellerName}</div>
                      <div className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{product.sellerEmail}</div>
                    </td>
                    <td>
                      <Badge tone={statusTone(product.status)}>{product.status}</Badge>
                    </td>
                    <td>
                      <Badge tone={product.isFeatured ? 'brand' : 'neutral'}>
                        {product.isFeatured ? 'Featured' : 'Not Featured'}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        <Button variant="primary" size="sm" onClick={() => moderateProduct(product.id, { status: 'active' })} disabled={isPending}>Approve</Button>
                        <Button variant="secondary" size="sm" onClick={() => moderateProduct(product.id, { status: 'draft' })} disabled={isPending}>Move to Draft</Button>
                        <Button
                          variant={product.isFeatured ? 'secondary' : 'primary'}
                          size="sm"
                          onClick={() => moderateProduct(product.id, { isFeatured: !product.isFeatured })}
                          disabled={isPending}
                        >
                          {product.isFeatured ? 'Unfeature' : 'Feature'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )
      )}

      {activeTab === 'content' && (
        posts.length === 0 ? (
          <EmptyState title="No community content" description="New posts from the community will appear here." />
        ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const isPending = isDeletingPost && pendingId === post.id;
            return (
              <div key={post.id} className="bhn-card bhn-card-pad">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold" style={{ color: 'var(--bhn-text)' }}>{post.authorName}</p>
                    <p className="text-xs" style={{ color: 'var(--bhn-text-muted)' }}>{post.authorEmail}</p>
                    <p className="mt-2 text-sm whitespace-pre-wrap" style={{ color: 'var(--bhn-text-muted)' }}>{post.content || 'No text content'}</p>
                  </div>
                  <Button variant="danger" size="sm" onClick={() => removePost(post.id)} disabled={isPending}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
    </div>
  );
}
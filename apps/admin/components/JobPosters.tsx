'use client';

import { useMemo, useState } from 'react';
import { Search, Briefcase, Users, ChevronDown, ChevronUp, ExternalLink, Eye, Mail, Clock3 } from 'lucide-react';
import { useGetJobPostersDetailedQuery, useGetJobPosterJobsQuery, useUpdateJobPosterStatusMutation } from '@/lib/adminApi';

export default function JobPosters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { data: posters = [], isLoading } = useGetJobPostersDetailedQuery();
  const [updateStatus] = useUpdateJobPosterStatusMutation();

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return posters;
    return posters.filter(p => [p.companyName, p.companyEmail, p.industry].join(' ').toLowerCase().includes(q));
  }, [searchTerm, posters]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleBan = async (id: string) => {
    if (!confirm('Ban this job poster?')) return;
    try { await updateStatus({ id, status: 'banned' }).unwrap(); } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Job Posters</h1>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[var(--bhn-text-muted)]" />
          <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search job posters..." className="admin-input pl-8 w-56" />
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-[var(--bhn-text-muted)]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-8 text-center text-sm text-[var(--bhn-text-muted)]">No job posters found</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <div key={p._id} className="card overflow-hidden">
              <div
                className="flex items-center gap-4 px-4 py-3 cursor-pointer hover:bg-[var(--bhn-surface-2)] transition-colors"
                onClick={() => toggleExpand(p._id)}
              >
                <div className="h-9 w-9 rounded-full bg-[var(--bhn-success-50)] text-[var(--bhn-success-700)] flex items-center justify-center font-bold text-xs shrink-0">
                  {p.companyName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--bhn-text)] truncate">{p.companyName}</span>
                    <span className={`admin-badge text-[10px] ${p.profileCompleted ? 'admin-badge-active' : 'admin-badge-pending'}`}>
                      {p.profileCompleted ? 'Complete' : 'Incomplete'}
                    </span>
                  </div>
                  <div className="text-xs text-[var(--bhn-text-muted)] truncate">{p.companyEmail} &bull; {p.industry || '—'}</div>
                </div>

                <div className="flex items-center gap-5 text-xs text-[var(--bhn-text)] shrink-0">
                  <div className="flex items-center gap-1" title="Total Jobs">
                    <Briefcase className="w-3 h-3 text-[var(--bhn-brand-500)]" />
                    <span className="font-medium">{p.totalJobs}</span>
                    <span className="text-[var(--bhn-success-600)]">({p.activeJobs} active)</span>
                  </div>
                  <div className="flex items-center gap-1" title="Applications">
                    <Users className="w-3 h-3 text-[var(--bhn-brand-500)]" />
                    <span>{p.totalApplications}</span>
                  </div>
                  <div className="text-[var(--bhn-text-muted)]">{p.companySize}</div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBan(p._id); }}
                    className="admin-btn admin-btn-danger text-[10px]"
                    title="Ban job poster"
                  >
                    Ban
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleExpand(p._id); }}
                    className="admin-btn admin-btn-secondary text-[10px]"
                    aria-expanded={expandedId === p._id}
                  >
                    <Eye className="w-3 h-3" /> Details
                  </button>
                  {expandedId === p._id ? <ChevronUp className="w-4 h-4 text-[var(--bhn-text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--bhn-text-muted)]" />}
                </div>
              </div>

              {expandedId === p._id && (
                <>
                  <JobPosterDetails poster={p} />
                  <JobPosterJobs posterId={p._id} />
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function JobPosterDetails({ poster }: { poster: import('@/lib/adminApi').AdminJobPosterDetailed }) {
  const joined = poster.createdAt ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(new Date(poster.createdAt)) : '—';
  return (
    <div className="border-t bg-[var(--bhn-surface-2)] px-4 py-4">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-semibold text-[var(--bhn-text)]">Company profile details</h2><span className={`admin-badge ${poster.profileCompleted ? 'admin-badge-active' : 'admin-badge-pending'}`}>{poster.profileCompleted ? 'Profile complete' : 'Profile incomplete'}</span></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4 text-xs">
        <section className="rounded-lg border bg-[var(--bhn-surface)] p-3"><h3 className="mb-2 font-semibold text-[var(--bhn-text)]">Contact</h3><p className="flex items-center gap-1 text-[var(--bhn-text)]"><Mail className="h-3 w-3" />{poster.companyEmail || 'Not provided'}</p><p className="mt-1.5 flex items-center gap-1 text-[var(--bhn-text)]"><Clock3 className="h-3 w-3" />Joined {joined}</p></section>
        <section className="rounded-lg border bg-[var(--bhn-surface)] p-3"><h3 className="mb-2 font-semibold text-[var(--bhn-text)]">Company</h3><p><span className="text-[var(--bhn-text-muted)]">Industry: </span>{poster.industry || 'Not provided'}</p><p className="mt-1.5"><span className="text-[var(--bhn-text-muted)]">Size: </span>{poster.companySize || 'Not provided'}</p>{poster.websiteUrl && <a href={poster.websiteUrl} target="_blank" rel="noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-[var(--bhn-brand-700)] hover:underline"><ExternalLink className="h-3 w-3" />Company website</a>}</section>
        <section className="rounded-lg border bg-[var(--bhn-surface)] p-3"><h3 className="mb-2 font-semibold text-[var(--bhn-text)]">Jobs</h3><p><span className="text-[var(--bhn-text-muted)]">Total: </span>{poster.totalJobs}</p><p className="mt-1.5"><span className="text-[var(--bhn-text-muted)]">Active: </span>{poster.activeJobs}</p></section>
        <section className="rounded-lg border bg-[var(--bhn-surface)] p-3"><h3 className="mb-2 font-semibold text-[var(--bhn-text)]">Recruitment activity</h3><p><span className="text-[var(--bhn-text-muted)]">Applications: </span>{poster.totalApplications}</p><p className="mt-1.5 text-[var(--bhn-text-muted)]">Posted jobs are listed below.</p></section>
      </div>
    </div>
  );
}

function JobPosterJobs({ posterId }: { posterId: string }) {
  const { data: jobs = [], isLoading } = useGetJobPosterJobsQuery(posterId);

  if (isLoading) return <div className="px-4 py-3 border-t text-xs text-[var(--bhn-text-muted)]">Loading jobs...</div>;
  if (jobs.length === 0) return <div className="px-4 py-3 border-t text-xs text-[var(--bhn-text-muted)]">No jobs posted yet</div>;

  return (
    <div className="border-t bg-[var(--bhn-surface-2)] px-4 py-3">
      <div className="flex items-center gap-2 mb-2">
        <Briefcase className="w-3.5 h-3.5 text-[var(--bhn-text-muted)]" />
        <span className="text-xs font-semibold text-[var(--bhn-text)]">Posted Jobs ({jobs.length})</span>
      </div>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {jobs.map((j) => (
          <div key={j._id} className="bg-[var(--bhn-surface)] rounded-lg px-3 py-2 border flex items-center justify-between text-xs">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-[var(--bhn-text)] truncate">{j.jobTitle}</span>
                <span className={`admin-badge text-[10px] ${j.status === 'active' ? 'admin-badge-active' : 'admin-badge-pending'}`}>{j.status}</span>
                {j.isFeatured && <span className="admin-badge text-[10px] bg-[var(--bhn-warning-50)] text-[var(--bhn-warning-700)]">Featured</span>}
              </div>
              <div className="text-[var(--bhn-text-muted)]">{j.jobCategory} &bull; {j.location || '—'} &bull; {j.salary || '—'}</div>
            </div>
            <div className="text-[var(--bhn-text-muted)] shrink-0 ml-3">{j.applicantCount} applicants</div>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plus, Search, MapPin, Users } from 'lucide-react';
import { useCreateJobMutation, useGetAllJobsQuery, useGetJobPostersQuery } from '@/lib/adminApi';

export default function Jobs() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ recruiterId: '', jobTitle: '', jobCategory: 'Other', jobType: 'Full-time', experienceLevel: 'Junior', salaryMin: '', salaryMax: '', location: '', openings: '1', aboutRole: '', status: 'active' });
  const { data: jobs = [], isLoading } = useGetAllJobsQuery();
  const { data: jobPosters = [] } = useGetJobPostersQuery();
  const [createJob, { isLoading: isCreating }] = useCreateJobMutation();
  const filtered = jobs.filter((j) => {
    const matchSearch = !search || j.jobTitle.toLowerCase().includes(search.toLowerCase()) || j.companyName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'admin-badge-active';
      case 'closed': case 'rejected': return 'admin-badge-inactive';
      case 'pending': case 'draft': return 'admin-badge-pending';
      default: return 'bg-gray-100 text-gray-600';
    }
  };
  const submit = async () => {
    if (!form.recruiterId || !form.jobTitle.trim()) return;
    try {
      await createJob({ ...form, jobTitle: form.jobTitle.trim(), salaryMin: Number(form.salaryMin) || 0, salaryMax: Number(form.salaryMax) || 0, openings: Number(form.openings) || 1 }).unwrap();
      setShowForm(false); setForm({ recruiterId: '', jobTitle: '', jobCategory: 'Other', jobType: 'Full-time', experienceLevel: 'Junior', salaryMin: '', salaryMax: '', location: '', openings: '1', aboutRole: '', status: 'active' });
    } catch (error) { console.error(error); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Job Listings</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="admin-btn admin-btn-primary"><Plus className="h-3.5 w-3.5" />Add Job</button>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input w-auto">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="closed">Closed</option>
          </select>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search jobs..." className="admin-input pl-8 w-56" />
          </div>
        </div>
      </div>

      {showForm && <div className="card mb-4 space-y-3">
        <div className="flex justify-between"><h2 className="text-sm font-semibold">Add Job</h2><button onClick={() => setShowForm(false)} className="admin-btn admin-btn-secondary">Cancel</button></div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <select className="admin-input" value={form.recruiterId} onChange={(e) => setForm({ ...form, recruiterId: e.target.value })}><option value="">Select job poster *</option>{jobPosters.map((poster) => <option key={poster.id} value={poster.id}>{poster.companyName} ({poster.companyEmail})</option>)}</select>
          <input className="admin-input" placeholder="Job title *" value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}/>
          <select className="admin-input" value={form.jobCategory} onChange={(e) => setForm({ ...form, jobCategory: e.target.value })}>{['Software Development','Design & Creative','Marketing','Sales','Finance','Human Resources','Customer Support','Education','Healthcare','Engineering','Other'].map((value) => <option key={value}>{value}</option>)}</select>
          <select className="admin-input" value={form.jobType} onChange={(e) => setForm({ ...form, jobType: e.target.value })}>{['Full-time','Part-time','Contract','Internship','Freelance'].map((value) => <option key={value}>{value}</option>)}</select>
          <input className="admin-input" type="number" placeholder="Minimum salary" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })}/><input className="admin-input" type="number" placeholder="Maximum salary" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })}/>
          <input className="admin-input" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}/><input className="admin-input" type="number" placeholder="Openings" value={form.openings} onChange={(e) => setForm({ ...form, openings: e.target.value })}/>
          <input className="admin-input md:col-span-2" placeholder="Role summary" value={form.aboutRole} onChange={(e) => setForm({ ...form, aboutRole: e.target.value })}/>
        </div><button disabled={isCreating} onClick={submit} className="admin-btn admin-btn-primary">{isCreating ? 'Creating...' : 'Create Job'}</button>
      </div>}

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-8 text-center text-sm text-gray-500">No jobs found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Company</th>
                <th>Category</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Applicants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j.id}>
                  <td className="text-xs font-medium">{j.jobTitle}</td>
                  <td className="text-xs">{j.companyName || '—'}</td>
                  <td className="text-xs">{j.jobCategory}</td>
                  <td className="text-xs flex items-center gap-1"><MapPin className="w-3 h-3 text-gray-400" /> {j.location || 'Remote'}</td>
                  <td className="text-xs">{j.salary || '—'}</td>
                  <td className="text-xs flex items-center gap-1"><Users className="w-3 h-3 text-gray-400" /> {j.applicantCount}</td>
                  <td><span className={`admin-badge ${statusColor(j.status)}`}>{j.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

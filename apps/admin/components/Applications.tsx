'use client';

import { useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { useGetApplicationsQuery } from '@/lib/adminApi';

export default function Applications() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { data: applications = [], isLoading } = useGetApplicationsQuery();
  const filtered = applications.filter((a) => {
    const matchSearch = !search || a.applicantName.toLowerCase().includes(search.toLowerCase()) || a.jobTitle.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case 'accepted': case 'hired': return 'admin-badge-active';
      case 'rejected': return 'admin-badge-inactive';
      case 'reviewed': case 'shortlisted': return 'admin-badge-pending';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Job Applications</h1>
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="admin-input w-auto">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applications..." className="admin-input pl-8 w-56" />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card py-8 text-center text-sm text-gray-500">No applications found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="admin-table w-full">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Job</th>
                <th>Applied</th>
                <th>Resume</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[10px]">
                        {a.applicantName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{a.applicantName}</p>
                        <p className="text-[10px] text-gray-500">{a.applicantEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-xs">{a.jobTitle}</td>
                  <td className="text-xs text-gray-500">{a.appliedAt ? new Date(a.appliedAt).toLocaleDateString() : '—'}</td>
                  <td>
                    {a.resumeUrl ? (
                      <a href={a.resumeUrl} target="_blank" rel="noopener noreferrer" className="admin-btn admin-btn-secondary text-[10px]">
                        <FileText className="w-3 h-3" /> View
                      </a>
                    ) : <span className="text-xs text-gray-400">—</span>}
                  </td>
                  <td><span className={`admin-badge ${statusColor(a.status)}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

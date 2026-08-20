'use client';

import { useState } from 'react';
import { Bell, Send, Search } from 'lucide-react';
import { useGetUsersQuery } from '@/lib/adminApi';

export default function NotificationManager() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState('');

  const { data: users = [] } = useGetUsersQuery();
  const filteredUsers = users.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    setSent(true);
    setTimeout(() => { setSent(false); setTitle(''); setMessage(''); }, 2000);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Notification Manager</h1>
        <span className="text-xs text-gray-500">{users.length} registered users</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] items-start">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold">Compose Notification</h2>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification Title" className="admin-input" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your notification message..." rows={5} className="admin-input resize-none" />
          <div className="flex items-center gap-3">
            <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)} className="admin-input w-auto">
              <option value="all">All Users</option>
              <option value="user">E-Commerce Users</option>
              <option value="student">Students</option>
              <option value="instructor">Instructors</option>
              <option value="recruiter">Job Posters</option>
              <option value="jobseeker">Job Seekers</option>
            </select>
            <button onClick={handleSend} disabled={!title.trim() || !message.trim()} className="admin-btn admin-btn-primary">
              <Send className="w-3.5 h-3.5" /> {sent ? 'Sent!' : 'Send Notification'}
            </button>
          </div>
          {sent && <p className="text-xs text-green-600 font-medium">Notification sent successfully to {targetRole === 'all' ? 'all users' : targetRole}.</p>}
        </div>

        <div className="card space-y-3">
          <h2 className="text-sm font-semibold flex items-center gap-2"><Bell className="w-4 h-4" /> Recent Users</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="admin-input pl-8" />
          </div>
          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredUsers.slice(0, 20).map((u) => (
              <div key={u.id} className="flex items-center gap-2 rounded-lg p-2 hover:bg-gray-50 text-xs">
                <div className="h-7 w-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[10px]">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium truncate">{u.name}</p>
                  <p className="text-gray-500 truncate">{u.email}</p>
                </div>
                <span className="admin-badge bg-gray-100 text-gray-600">{u.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Search, Filter, Eye } from 'lucide-react';
import { useGetAuditLogsQuery } from '@/lib/adminApi';

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: logs = [], isLoading } = useGetAuditLogsQuery({ action: actionFilter || undefined, entity: entityFilter || undefined });

  const uniqueActions = [...new Set(logs.map((l) => l.action))];
  const uniqueEntities = [...new Set(logs.map((l) => l.entity))];

  const statusColor = (status: string) => {
    switch (status) {
      case 'success': return 'admin-badge-active';
      case 'failure': return 'admin-badge-inactive';
      case 'warning': return 'admin-badge-pending';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="admin-page-heading">Audit Logs</h1>
        <span className="text-xs text-gray-500">{logs.length} entries</span>
      </div>

      <div className="flex gap-2 mb-4">
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="admin-input w-auto">
          <option value="">All Actions</option>
          {uniqueActions.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={entityFilter} onChange={(e) => setEntityFilter(e.target.value)} className="admin-input w-auto">
          <option value="">All Entities</option>
          {uniqueEntities.map((e) => <option key={e} value={e}>{e}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-500">Loading...</div>
      ) : logs.length === 0 ? (
        <div className="card py-8 text-center text-sm text-gray-500">No audit logs found</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log.id} className="card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <span className={`admin-badge ${statusColor(log.status)}`}>{log.status}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{log.action} — {log.entity}</p>
                    <p className="text-[10px] text-gray-500">by {log.userName} • {new Date(log.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <button onClick={() => setExpandedId(expandedId === log.id ? null : log.id)} className="admin-btn admin-btn-secondary ml-2">
                  <Eye className="w-3 h-3" />
                </button>
              </div>
              {expandedId === log.id && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs space-y-1">
                  <p><span className="text-gray-500">Entity ID:</span> <span className="font-mono">{log.entityId || 'N/A'}</span></p>
                  <p><span className="text-gray-500">IP Address:</span> {log.ipAddress || 'N/A'}</p>
                  {log.details && <p><span className="text-gray-500">Details:</span> {log.details}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

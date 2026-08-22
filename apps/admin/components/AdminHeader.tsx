'use client';

import { Bell, Search, Settings, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AdminHeader({ title }: { title?: string }) {
  const [userName, setUserName] = useState('Admin');
  useEffect(() => { setUserName(localStorage.getItem('adminName') || localStorage.getItem('userName') || 'Admin'); }, []);
  return <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-xl sm:px-6"><div className="flex items-center justify-between gap-4"><div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-orange-600">Bandhan administration</p><h1 className="truncate text-lg font-bold text-slate-900">{title || 'Dashboard'}</h1></div><div className="flex items-center gap-2"><div className="hidden w-64 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 lg:flex"><Search className="h-4 w-4 text-slate-400" /><span className="text-xs text-slate-400">Search the control centre</span></div><button type="button" aria-label="Notifications" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"><Bell className="h-4 w-4" /></button><button type="button" aria-label="Settings" className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50"><Settings className="h-4 w-4" /></button><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-2 pr-3"><span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-orange-700"><ShieldCheck className="h-4 w-4" /></span><span className="hidden max-w-28 truncate text-xs font-semibold text-slate-700 sm:block">{userName}</span></div></div></div></header>;
}

'use client';

import { useState } from 'react';
import { BarChart3, Bell, BookOpen, BriefcaseBusiness, Building2, ChevronDown, ClipboardList, DollarSign, FileText, GraduationCap, LayoutDashboard, LifeBuoy, LogOut, Package, Scale, Settings, ShieldCheck, ShoppingCart, Tags, TicketPercent, Users } from 'lucide-react';

export type AdminPage =
  | 'dashboard' | 'users' | 'students' | 'instructors' | 'courses' | 'enrollments' | 'job-seekers' | 'job-posters' | 'moderation' | 'categories' | 'commissions' | 'featured-listings' | 'disputes' | 'support-tickets' | 'roles-permissions' | 'content-governance' | 'products' | 'orders' | 'rental-orders' | 'analytics' | 'blogs' | 'banners' | 'settings' | 'coupons' | 'notifications' | 'financial-reports' | 'audit-logs' | 'merchants' | 'venues' | 'services' | 'jobs' | 'applications';

interface SidebarProps { currentPage: AdminPage; setCurrentPage: (page: AdminPage) => void; }

const sections: Array<{ title: string; items: Array<{ id: AdminPage; label: string; icon: typeof LayoutDashboard }> }> = [
  { title: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }, { id: 'analytics', label: 'Analytics', icon: BarChart3 }, { id: 'notifications', label: 'Notifications', icon: Bell }] },
  { title: 'Commerce', items: [{ id: 'products', label: 'Products', icon: Package }, { id: 'services', label: 'Services', icon: Building2 }, { id: 'venues', label: 'Venues', icon: Building2 }, { id: 'orders', label: 'Orders & bookings', icon: ShoppingCart }, { id: 'rental-orders', label: 'Rental orders', icon: ClipboardList }, { id: 'merchants', label: 'Merchants', icon: Building2 }] },
  { title: 'People & learning', items: [{ id: 'users', label: 'Users', icon: Users }, { id: 'students', label: 'Students', icon: GraduationCap }, { id: 'instructors', label: 'Instructors', icon: GraduationCap }, { id: 'courses', label: 'Courses', icon: BookOpen }, { id: 'enrollments', label: 'Enrollments', icon: ClipboardList }] },
  { title: 'Jobs', items: [{ id: 'jobs', label: 'All jobs', icon: BriefcaseBusiness }, { id: 'applications', label: 'Applications', icon: ClipboardList }, { id: 'job-seekers', label: 'Job seekers', icon: Users }, { id: 'job-posters', label: 'Job posters', icon: Building2 }] },
  { title: 'Configuration', items: [{ id: 'categories', label: 'Categories', icon: Tags }, { id: 'coupons', label: 'Coupons', icon: TicketPercent }, { id: 'commissions', label: 'Commissions', icon: DollarSign }, { id: 'financial-reports', label: 'Finance', icon: DollarSign }, { id: 'settings', label: 'Settings', icon: Settings }] },
  { title: 'Trust & support', items: [{ id: 'moderation', label: 'Moderation', icon: ShieldCheck }, { id: 'content-governance', label: 'Content', icon: FileText }, { id: 'disputes', label: 'Disputes', icon: Scale }, { id: 'support-tickets', label: 'Support tickets', icon: LifeBuoy }, { id: 'audit-logs', label: 'Audit log', icon: ClipboardList }] },
];

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({ Overview: true, Commerce: true, 'People & learning': true, Jobs: true, Configuration: true, 'Trust & support': true });
  return <aside className="admin-sidebar hidden h-dvh w-[17.5rem] shrink-0 flex-col overflow-hidden lg:flex">
    <div className="border-b border-white/10 px-5 py-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-black text-white shadow-lg shadow-orange-950/30">B</span><div><p className="font-bold tracking-tight text-white">Bandhan</p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-200">Admin control centre</p></div></div></div>
    <nav className="admin-scrollbar flex-1 overflow-y-auto px-3 py-4">{sections.map((section) => { const expanded = open[section.title]; return <div key={section.title} className="mb-3"><button type="button" onClick={() => setOpen((previous) => ({ ...previous, [section.title]: !expanded }))} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 hover:bg-white/5 hover:text-white"><span>{section.title}</span><ChevronDown className={`h-3.5 w-3.5 transition-transform ${expanded ? '' : '-rotate-90'}`} /></button>{expanded && <div className="mt-1 space-y-1">{section.items.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setCurrentPage(id)} className={`admin-sidebar-item ${currentPage === id ? 'admin-sidebar-item-active' : ''}`}><Icon className="h-4 w-4 shrink-0" /><span>{label}</span></button>)}</div>}</div>; })}</nav>
    <div className="border-t border-white/10 p-3"><div className="mb-2 rounded-xl bg-white/5 px-3 py-2.5"><p className="text-xs font-semibold text-white">Administrator</p><p className="mt-0.5 text-[11px] text-slate-400">Full platform access</p></div><button type="button" onClick={() => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser'); window.location.href = '/admin/login'; }} className="admin-sidebar-item w-full text-rose-300 hover:bg-rose-500/10 hover:text-rose-100"><LogOut className="h-4 w-4" /> Logout</button></div>
  </aside>;
}

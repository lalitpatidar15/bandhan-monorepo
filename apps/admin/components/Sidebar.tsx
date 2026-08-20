'use client';

import { PortalSidebar, type PortalSidebarSection } from '@bandhan/ui';
import {
  LayoutDashboard, Users, Package, ShoppingCart, BarChart3, Settings,
  GraduationCap, BookOpen, BookMarked, School, Briefcase, Building2,
  ShieldCheck, Tags, BadgePercent, Star, Scale, LifeBuoy, KeyRound,
  FileText, Newspaper, Image, RotateCcw, TicketPercent, Bell, DollarSign,
  ClipboardList, BriefcaseBusiness, ScrollText, MapPin, Handshake,
} from 'lucide-react';

export type AdminPage =
  | 'dashboard' | 'users' | 'students' | 'instructors' | 'courses'
  | 'enrollments' | 'job-seekers' | 'job-posters' | 'moderation'
  | 'categories' | 'commissions' | 'featured-listings' | 'disputes'
  | 'support-tickets' | 'roles-permissions' | 'content-governance'
  | 'products' | 'orders' | 'rental-orders' | 'analytics' | 'blogs'
  | 'banners' | 'settings' | 'coupons' | 'notifications'
  | 'financial-reports' | 'audit-logs' | 'merchants' | 'venues'
  | 'services' | 'jobs' | 'applications';

interface SidebarProps {
  currentPage: AdminPage;
  setCurrentPage: (page: AdminPage) => void;
}

const icons: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard, users: Users, students: GraduationCap,
  instructors: School, courses: BookOpen, enrollments: BookMarked,
  'job-seekers': Briefcase, 'job-posters': Building2, moderation: ShieldCheck,
  categories: Tags, commissions: BadgePercent, 'featured-listings': Star,
  disputes: Scale, 'support-tickets': LifeBuoy, 'roles-permissions': KeyRound,
  'content-governance': FileText, products: Package, orders: ShoppingCart,
  'rental-orders': RotateCcw, analytics: BarChart3, blogs: Newspaper,
  banners: Image, coupons: TicketPercent, notifications: Bell,
  merchants: Building2, venues: MapPin, services: Handshake,
  jobs: BriefcaseBusiness, applications: ScrollText,
  'financial-reports': DollarSign, 'audit-logs': ClipboardList, settings: Settings,
};

const sectionDefs: Array<{ title: string; ids: AdminPage[] }> = [
  { title: 'Admin', ids: ['dashboard', 'users', 'students', 'instructors', 'courses', 'enrollments', 'job-seekers', 'job-posters', 'roles-permissions', 'content-governance', 'analytics', 'audit-logs', 'settings'] },
  { title: 'Marketplace', ids: ['products', 'orders', 'rental-orders', 'merchants', 'venues', 'services', 'jobs', 'applications', 'categories', 'commissions', 'featured-listings', 'coupons', 'blogs', 'banners', 'notifications'] },
  { title: 'Finance', ids: ['financial-reports'] },
  { title: 'Support', ids: ['moderation', 'disputes', 'support-tickets'] },
];

const labels: Record<AdminPage, string> = {
  dashboard: 'Dashboard', users: 'Users', students: 'Students', instructors: 'Instructors',
  courses: 'Courses', enrollments: 'Enrollments', 'job-seekers': 'Job Seekers',
  'job-posters': 'Job Posters', moderation: 'Moderation', categories: 'Categories',
  commissions: 'Commissions', 'featured-listings': 'Featured Listings', disputes: 'Disputes',
  'support-tickets': 'Support Tickets', 'roles-permissions': 'Roles & Permissions',
  'content-governance': 'Content Governance', products: 'Products & Services',
  orders: 'Orders & Bookings', 'rental-orders': 'Rental Orders', analytics: 'Analytics',
  blogs: 'Blog Posts', banners: 'Banners', coupons: 'Coupons', notifications: 'Notifications',
  merchants: 'Merchants', venues: 'Venues', services: 'Services', jobs: 'All Jobs',
  applications: 'Applications', 'financial-reports': 'Financial Reports',
  'audit-logs': 'Audit Logs', settings: 'Settings',
};

export default function Sidebar({ currentPage, setCurrentPage }: SidebarProps) {
  const sections: PortalSidebarSection[] = sectionDefs.map((s) => ({
    title: s.title,
    items: s.ids.map((id) => {
      const IconComp = icons[id];
      return {
        label: labels[id],
        icon: <IconComp size={16} />,
      };
    }),
  }));

  // Map label back to page id
  const labelToId = Object.fromEntries(Object.entries(labels).map(([k, v]) => [v, k])) as Record<string, AdminPage>;

  return (
    <PortalSidebar
      portalName="Control Center"
      sections={sections}
      activeItem={labels[currentPage]}
      onNavigate={(label) => {
        const id = labelToId[label];
        if (id) setCurrentPage(id);
      }}
      onLogout={() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/admin/login';
      }}
    />
  );
}
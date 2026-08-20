'use client';

import { useState } from 'react';

import Sidebar, { type AdminPage } from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Instructors from '@/components/Instructors';
import Courses from '@/components/Courses';
import Enrollments from '@/components/Enrollments';
import JobSeekers from '@/components/JobSeekers';
import JobPosters from '@/components/JobPosters';
import Moderation from '@/components/Moderation';
import Categories from '@/components/Categories';
import Commissions from '@/components/Commissions';
import FeaturedListings from '@/components/FeaturedListings';
import Disputes from '@/components/Disputes';
import SupportTickets from '@/components/SupportTickets';
import RolesPermissions from '@/components/RolesPermissions';
import ContentGovernance from '@/components/ContentGovernance';
import Products from '@/components/Products';
import Orders from '@/components/Orders';
import RentalOrders from '@/components/RentalOrders';
import Analytics from '@/components/Analytics';
import Blogs from '@/components/Blogs';
import Banners from '@/components/Banners';
import Settings from '@/components/Settings';
import CouponManager from '@/components/CouponManager';
import NotificationManager from '@/components/NotificationManager';
import FinancialReports from '@/components/FinancialReports';
import AuditLogs from '@/components/AuditLogs';
import Merchants from '@/components/Merchants';
import Venues from '@/components/Venues';
import Services from '@/components/Services';
import Jobs from '@/components/Jobs';
import Applications from '@/components/Applications';
import AdminHeader from '@/components/AdminHeader';

export default function AdminDashboardPage() {
  const [currentPage, setCurrentPage] =
    useState<AdminPage>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;

      case 'users':
        return <Users />;

      case 'students':
        return <Students />;

      case 'instructors':
        return <Instructors />;

      case 'courses':
        return <Courses />;

      case 'enrollments':
        return <Enrollments />;

      case 'job-seekers':
        return <JobSeekers />;

      case 'job-posters':
        return <JobPosters />;

      case 'moderation':
        return <Moderation />;

      case 'categories':
        return <Categories />;

      case 'commissions':
        return <Commissions />;

      case 'featured-listings':
        return <FeaturedListings />;

      case 'disputes':
        return <Disputes />;

      case 'support-tickets':
        return <SupportTickets />;

      case 'roles-permissions':
        return <RolesPermissions />;

      case 'content-governance':
        return <ContentGovernance />;

      case 'products':
        return <Products />;

      case 'orders':
        return <Orders />;

      case 'rental-orders':
        return <RentalOrders />;

      case 'analytics':
        return <Analytics />;

      case 'blogs':
        return <Blogs />;

      case 'banners':
        return <Banners />;

      case 'settings':
        return <Settings />;

      case 'coupons':
        return <CouponManager />;

      case 'notifications':
        return <NotificationManager />;

      case 'financial-reports':
        return <FinancialReports />;

      case 'audit-logs':
        return <AuditLogs />;

      case 'merchants':
        return <Merchants />;

      case 'venues':
        return <Venues />;

      case 'services':
        return <Services />;

      case 'jobs':
        return <Jobs />;

      case 'applications':
        return <Applications />;

      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  const pageTitle = currentPage.replace(/-/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-gray-100">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <main className="min-w-0 flex-1 overflow-y-auto">
        <AdminHeader title={pageTitle} />
        <div className="min-h-full p-4">
          {renderPage()}
        </div>
      </main>
    </div>
  );
}

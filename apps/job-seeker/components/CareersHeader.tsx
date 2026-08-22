'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { centralLoginUrl, clearJobPortalSession, readTokenRole } from '@/lib/session';

interface CareersHeaderProps {
  variant?: 'jobs' | 'jobposter';
  activeTab?: string;
  stepLabel?: string;
}

export function CareersHeader({ variant = 'jobs', activeTab }: CareersHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = token ? readTokenRole(token) : null;
    const valid = Boolean(role && (variant === 'jobs' ? role === 'jobseeker' : role === 'recruiter'));
    setIsAuthenticated(valid);
    setUserName(valid ? (localStorage.getItem('userName') || localStorage.getItem('companyName') || '') : '');
  }, [pathname, variant]);

  const isJobseeker = variant === 'jobs';

  const navItems = isJobseeker
    ? [
        { label: 'Dashboard', href: '/Jobseeker/dashboard' },
        { label: 'Jobs', href: '/Jobseeker/jobs' },
        { label: 'Applications', href: '/Jobseeker/applications' },
        { label: 'Messages', href: '/Jobseeker/messages' },
        { label: 'Payments', href: '/Jobseeker/payments' },
      ]
    : [
        { label: 'Dashboard', href: '/jobposter/dashboard' },
        { label: 'Jobs', href: '/jobposter/jobpost' },
        { label: 'Applications', href: '/jobposter/Application' },
        { label: 'Messages', href: '/jobposter/messages' },
        { label: 'Payments', href: '/jobposter/payments' },
      ];

  const actions = isAuthenticated ? [
    { icon: <Bell size={19} />, label: 'Notifications', href: isJobseeker ? '/Jobseeker/notifications' : '/jobposter/notifications' },
  ] : [];

  const dropdownItems = isAuthenticated ? [
    { label: userName || (isJobseeker ? 'Job Seeker' : 'Employer') },
    { divider: true },
    { label: 'Profile', href: isJobseeker ? '/Jobseeker/profile' : '/jobposter/profileview' },
    { label: isJobseeker ? 'My Applications' : 'My Jobs', href: isJobseeker ? '/Jobseeker/applications' : '/jobposter/jobpost' },
    { label: 'Messages', href: isJobseeker ? '/Jobseeker/messages' : '/jobposter/messages' },
    { divider: true },
    { label: 'Logout', onClick: () => { clearJobPortalSession(); window.location.assign(centralLoginUrl()); }, destructive: true },
  ] : [
    { label: 'Login', href: isJobseeker ? '/Jobseeker/login' : '/jobposter/login' },
    { label: 'Create account', href: isJobseeker ? '/Jobseeker/signup' : '/jobposter/register' },
  ];

  const activeNav = activeTab || pathname;

  return (
    <PortalHeader
      portalName={isJobseeker ? 'Careers — Job Seeker' : 'Careers — Employer'}
      navItems={navItems}
      actions={actions}
      userName={isAuthenticated ? userName : undefined}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push(isJobseeker ? '/Jobseeker/dashboard' : '/jobposter/dashboard')}
      activeNav={activeNav}
    />
  );
}

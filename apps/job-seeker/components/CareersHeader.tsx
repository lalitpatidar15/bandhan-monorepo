'use client';

import { PortalHeader } from '@bandhan/ui';
import { useRouter, usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { clearJobPortalSession } from '@/lib/session';

interface CareersHeaderProps {
  variant?: 'jobs' | 'jobposter';
  activeTab?: string;
  stepLabel?: string;
}

export function CareersHeader({ variant = 'jobs', activeTab }: CareersHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const name = localStorage.getItem('userName') || localStorage.getItem('companyName') || '';
    setUserName(name);
  }, []);

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

  const actions = [
    { icon: <Bell size={19} />, label: 'Notifications', href: isJobseeker ? '/Jobseeker/notifications' : '/jobposter/notifications' },
  ];

  const dropdownItems = [
    { label: userName || (isJobseeker ? 'Job Seeker' : 'Employer') },
    { divider: true },
    { label: 'Profile', href: isJobseeker ? '/Jobseeker/profile' : '/jobposter/profileview' },
    { label: isJobseeker ? 'My Applications' : 'My Jobs', href: isJobseeker ? '/Jobseeker/applications' : '/jobposter/jobpost' },
    { label: 'Messages', href: isJobseeker ? '/Jobseeker/messages' : '/jobposter/messages' },
    { divider: true },
    { label: 'Logout', onClick: () => { clearJobPortalSession(); router.replace('/login'); }, destructive: true },
  ];

  const activeNav = activeTab || pathname;

  return (
    <PortalHeader
      portalName={isJobseeker ? 'Careers — Job Seeker' : 'Careers — Employer'}
      navItems={navItems}
      actions={actions}
      userName={userName}
      dropdownItems={dropdownItems}
      onLogoClick={() => router.push(isJobseeker ? '/Jobseeker/dashboard' : '/jobposter/dashboard')}
      activeNav={activeNav}
    />
  );
}
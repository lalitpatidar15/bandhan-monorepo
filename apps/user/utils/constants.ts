import { LucideIcon } from 'lucide-react';
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Star,
  Wallet,
  UserSearch,
  HeartHandshakeIcon,
} from 'lucide-react';

export interface DashboardMenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export const dashboardMenu: DashboardMenuItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', path: '/dashboard/leads', icon: UserSearch },
  { name: 'Services', path: '/dashboard/services', icon: HeartHandshakeIcon },
  { name: 'Calendar', path: '/dashboard/calendar', icon: Calendar },
  { name: 'Earnings', path: '/dashboard/earnings', icon: Wallet },
  { name: 'Reviews', path: '/dashboard/reviews', icon: Star },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
];

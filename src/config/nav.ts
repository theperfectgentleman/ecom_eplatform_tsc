import { LayoutDashboard, Send, BarChart, Contact, Calendar, Users } from 'lucide-react';

export const navConfig = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Referral',
    href: '/referral',
    icon: Send,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart,
  },
  {
    title: 'Address Book',
    href: '/address-book',
    icon: Contact,
  },
  {
    title: 'Appointments',
    href: '/appointments',
    icon: Calendar,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Users,
  },
];

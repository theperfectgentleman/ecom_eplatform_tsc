import { LayoutDashboard, FileText, Book, Users, Settings } from 'lucide-react';

export const navConfig = [
  {
    title: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: 'Referral',
    href: '/referral',
    icon: FileText,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: Book,
  },
  {
    title: 'Address Book',
    href: '/address-book',
    icon: Book,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Settings,
  },
];

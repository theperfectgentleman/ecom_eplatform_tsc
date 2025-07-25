import { LayoutDashboard, Send, BarChart, Contact, Calendar, Users, BookOpen, MessageSquare, FileText, Settings, HelpCircle } from 'lucide-react';

export interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  subItems?: NavSubItem[];
}

export interface NavSubItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const navConfig: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
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
    icon: Users,
    subItems: [
      {
        title: 'User Management',
        href: '/admin',
        icon: Users,
      },
      {
        title: 'System Settings',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: 'Technical Documentation',
        href: '/admin/docs',
        icon: FileText,
      },
      {
        title: 'Implementation Guide',
        href: '/admin/implementation',
        icon: HelpCircle,
      },
    ],
  },
  {
    title: 'Guide',
    href: '/guide',
    icon: BookOpen,
  },
  {
    title: 'Feedback',
    href: '/feedback',
    icon: MessageSquare,
  },
];

'use client';

import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import type { FC } from 'react';
import {
  Archive,
  BarChartSquare02,
  CheckDone01,
  ClockFastForward,
  CurrencyDollarCircle,
  Grid03,
  HomeLine,
  Inbox01,
  LifeBuoy01,
  LineChartUp03,
  NotificationBox,
  Package,
  PieChart03,
  Rows01,
  Settings01,
  Settings03,
  Star01,
  Stars01,
  User01,
  UserSquare,
  Users01,
  UsersPlus,
  VideoRecorder,
  Image01,
  UserPlus01
} from '@untitledui/icons';
import type { NavItemType } from '@/components/application/app-navigation/config';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { usePathname } from 'next/navigation';

const navItems: (NavItemType & { icon: FC<{ className?: string }> })[] = [
  {
    label: 'Home',
    href: '/',
    icon: HomeLine,
  },
  {
    label: 'Live Camera',
    href: '/camera',
    icon: VideoRecorder,
  },
  {
    label: 'Captured',
    href: '/captured',
    icon: Image01,
  },
  {
    label: 'People',
    href: '/people',
    icon: UserPlus01,
  },
];

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  return (
    <>
      <SidebarNavigationSlim
        activeUrl={pathname}
        items={navItems}
      />
      <div>{children}</div>
    </>
  );
}

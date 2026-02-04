'use client';

import type { FC } from 'react';
import type { NavItemType } from '@/components/application/app-navigation/config';
import { SidebarNavigationSlim } from '@/components/application/app-navigation/sidebar-navigation/sidebar-slim';
import { usePathname } from 'next/navigation';
import { House, Video, Image, Database } from 'lucide-react';
import { AuthProvider } from '@/contexts/auth-context';

const navItems: (NavItemType & { icon: FC<{ className?: string }> })[] = [
  {
    label: 'Home',
    href: '/',
    icon: House,
  },
  {
    label: 'Live Camera',
    href: '/camera',
    icon: Video,
  },
  {
    label: 'Captured',
    href: '/captured',
    icon: Image,
  },
  {
    label: 'Manage Data',
    href: '/data',
    icon: Database,
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
      <SidebarNavigationSlim activeUrl={pathname} items={navItems} />
      <div className="lg:pl-17">{children}</div>
    </>
  );
}

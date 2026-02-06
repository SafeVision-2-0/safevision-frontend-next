'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { LifeBuoy01, LogOut01, Moon01, Settings01, Sun } from '@untitledui/icons';
import { AnimatePresence, motion } from 'motion/react';
import {
  Button as AriaButton,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from 'react-aria-components';
import { Avatar } from '@/components/base/avatar/avatar';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Button } from '@/components/base/buttons/button';
import { ButtonUtility } from '@/components/base/buttons/button-utility';
import { UntitledLogo } from '@/components/foundations/logo/untitledui-logo';
import { UntitledLogoMinimal } from '@/components/foundations/logo/untitledui-logo-minimal';
import { cx } from '@/utils/cx';
import { MobileNavigationHeader } from '../base-components/mobile-header';
import { NavAccountMenu } from '../base-components/nav-account-card';
import { NavItemBase } from '../base-components/nav-item';
import { NavItemButton } from '../base-components/nav-item-button';
import { NavList } from '../base-components/nav-list';
import type { NavItemType } from '../config';
import SafevisionAppLogo from '@/components/foundations/logo/safevision-app-logo';
import { useAuth } from '@/contexts/auth-context';
import { getInitials } from '@/lib/helpers/format';
import { useTheme } from 'next-themes';

interface SidebarNavigationSlimProps {
  /** URL of the currently active item. */
  activeUrl?: string;
  /** List of items to display. */
  items: (NavItemType & { icon: FC<{ className?: string }> })[];
  /** List of footer items to display. */
  footerItems?: (NavItemType & { icon: FC<{ className?: string }> })[];
  /** Whether to hide the border. */
  hideBorder?: boolean;
  /** Whether to hide the right side border. */
  hideRightBorder?: boolean;
}

export const SidebarNavigationSlim = ({
  activeUrl,
  items,
  footerItems = [],
  hideBorder,
  hideRightBorder,
}: SidebarNavigationSlimProps) => {
  const activeItem = [...items, ...footerItems].find(
    (item) => item.href === activeUrl || item.items?.some((subItem) => subItem.href === activeUrl),
  );
  const [currentItem, setCurrentItem] = useState(activeItem || items[1]);
  const [isHovering, setIsHovering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isSecondarySidebarVisible = isHovering && Boolean(currentItem.items?.length);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const MAIN_SIDEBAR_WIDTH = 68;
  const SECONDARY_SIDEBAR_WIDTH = 268;

  const mainSidebar = (
    <aside
      style={{
        width: MAIN_SIDEBAR_WIDTH,
      }}
      className={cx(
        'group flex h-full max-h-full max-w-full overflow-y-auto py-1 pl-1 transition duration-100 ease-linear',
        isSecondarySidebarVisible && 'bg-primary',
      )}
    >
      <div
        className={cx(
          'bg-primary ring-secondary flex w-auto flex-col justify-between rounded-xl pt-5 ring-1 transition duration-300 ring-inset',
          hideBorder && !isSecondarySidebarVisible && 'ring-transparent',
        )}
      >
        <div className="flex justify-center px-3">
          <SafevisionAppLogo />
        </div>

        <ul className="mt-4 flex flex-col gap-0.5 px-3">
          {items.map((item) => (
            <li key={item.label}>
              <NavItemButton
                size="md"
                current={currentItem.href === item.href}
                href={item.href}
                label={item.label || ''}
                icon={item.icon}
                onClick={() => setCurrentItem(item)}
              />
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-col gap-4 px-3 py-5">
          {footerItems.length > 0 && (
            <ul className="flex flex-col gap-0.5">
              {footerItems.map((item) => (
                <li key={item.label}>
                  <NavItemButton
                    size="md"
                    current={currentItem.href === item.href}
                    label={item.label || ''}
                    href={item.href}
                    icon={item.icon}
                    onClick={() => setCurrentItem(item)}
                  />
                </li>
              ))}
            </ul>
          )}

          {isMounted && (
            <AriaDialogTrigger>
              <AriaButton
                className={({ isPressed, isFocused }) =>
                  cx(
                    'group relative inline-flex rounded-full',
                    (isPressed || isFocused) && 'outline-focus-ring outline-2 outline-offset-2',
                  )
                }
              >
                <Avatar
                  status="online"
                  src=""
                  size="md"
                  alt={user?.profile?.name ?? ''}
                  initials={getInitials(user?.username ?? '')}
                />
              </AriaButton>
              <AriaPopover
                placement="right bottom"
                offset={8}
                crossOffset={6}
                className={({ isEntering, isExiting }) =>
                  cx(
                    'will-change-transform',
                    isEntering &&
                      'animate-in fade-in placement-right:slide-in-from-left-2 placement-top:slide-in-from-bottom-2 placement-bottom:slide-in-from-top-2 duration-300 ease-out',
                    isExiting &&
                      'animate-out fade-out placement-right:slide-out-to-left-2 placement-top:slide-out-to-bottom-2 placement-bottom:slide-out-to-top-2 duration-150 ease-in',
                  )
                }
              >
                <NavAccountMenu />
              </AriaPopover>
            </AriaDialogTrigger>
          )}
        </div>
      </div>
    </aside>
  );

  const secondarySidebar = (
    <AnimatePresence initial={false}>
      {isSecondarySidebarVisible && (
        <motion.div
          initial={{ width: 0, borderColor: 'var(--color-border-secondary)' }}
          animate={{ width: SECONDARY_SIDEBAR_WIDTH, borderColor: 'var(--color-border-secondary)' }}
          exit={{
            width: 0,
            borderColor: 'rgba(0,0,0,0)',
            transition: { borderColor: { type: 'tween', delay: 0.05 } },
          }}
          transition={{ type: 'spring', damping: 26, stiffness: 220, bounce: 0 }}
          className={cx(
            'bg-primary relative h-full overflow-x-hidden overflow-y-auto',
            !(hideBorder || hideRightBorder) && 'box-content border-r-[1.5px]',
          )}
        >
          <div
            style={{ width: SECONDARY_SIDEBAR_WIDTH }}
            className="flex h-full flex-col px-4 pt-6"
          >
            <h3 className="text-brand-secondary text-sm font-semibold">{currentItem.label}</h3>
            <ul className="py-2">
              {currentItem.items?.map((item) => (
                <li key={item.label} className="py-0.5">
                  <NavItemBase
                    current={activeUrl === item.href}
                    href={item.href}
                    icon={item.icon}
                    badge={item.badge}
                    type="link"
                  >
                    {item.label}
                  </NavItemBase>
                </li>
              ))}
            </ul>
            <div className="border-secondary bg-primary sticky bottom-0 mt-auto flex justify-between border-t px-2 py-5">
              <div>
                <p className="text-primary text-sm font-semibold">Olivia Rhye</p>
                <p className="text-tertiary text-sm">olivia@untitledui.com</p>
              </div>
              <div className="absolute top-2.5 right-0">
                <ButtonUtility size="sm" color="tertiary" tooltip="Log out" icon={LogOut01} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop sidebar navigation */}
      <div
        className="z-50 hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex"
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
      >
        {mainSidebar}
        {secondarySidebar}
      </div>

      {/* Placeholder to take up physical space because the real sidebar has `fixed` position. */}
      <div
        style={{
          paddingLeft: MAIN_SIDEBAR_WIDTH,
        }}
        className="invisible hidden lg:sticky lg:top-0 lg:bottom-0 lg:left-0 lg:block"
      />

      {/* Mobile header navigation */}
      {isMounted && (
        <MobileNavigationHeader>
          <aside className="group bg-primary flex h-full max-h-full w-full max-w-full flex-col justify-between overflow-y-auto pt-4">
            <div className="px-4">
              <SafevisionAppLogo full />
            </div>

            <NavList items={items} />

            <div className="mt-auto flex flex-col gap-5 px-2 py-4">
              <Button
                aria-label="Toggle theme"
                color="tertiary"
                size="sm"
                className="justify-start"
                iconLeading={theme === 'light' ? Moon01 : Sun}
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              </Button>
              <div className="border-secondary relative flex items-center gap-3 border-t pt-6 pr-8 pl-2">
                <AvatarLabelGroup
                  status="online"
                  size="md"
                  initials={getInitials(user?.username ?? '')}
                  title={user?.profile?.name ?? ''}
                  subtitle={user?.email ?? ''}
                />

                <div className="absolute top-1/2 right-0 -translate-y-1/2">
                  <Button
                    size="sm"
                    color="tertiary"
                    iconLeading={
                      <LogOut01 className="text-fg-quaternary transition-inherit-all group-hover:text-fg-quaternary_hover size-5" />
                    }
                    className="p-1.5!"
                  />
                </div>
              </div>
            </div>
          </aside>
        </MobileNavigationHeader>
      )}
    </>
  );
};

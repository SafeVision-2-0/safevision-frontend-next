'use client';

import type { FC, HTMLAttributes } from 'react';
import { useCallback, useEffect, useRef } from 'react';
import type { Placement } from '@react-types/overlays';
import { ChevronSelectorVertical, LogOut01, Moon01, Sun } from '@untitledui/icons';
import { useFocusManager } from 'react-aria';
import type { DialogProps as AriaDialogProps } from 'react-aria-components';
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from 'react-aria-components';
import { AvatarLabelGroup } from '@/components/base/avatar/avatar-label-group';
import { Button } from '@/components/base/buttons/button';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { cx } from '@/utils/cx';
import { useTheme } from 'next-themes';
import { useAuth } from '@/contexts/auth-context';
import { getInitials } from '@/lib/helpers/format';
import { useRouter } from 'next/navigation';

export const NavAccountMenu = ({
  className,
  ...dialogProps
}: AriaDialogProps & {
  className?: string;
}) => {
  const focusManager = useFocusManager();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    // Clear cookie
    document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.refresh();
    router.push('/login');
  };

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          focusManager?.focusNext({ tabbable: true, wrap: true });
          break;
        case 'ArrowUp':
          focusManager?.focusPrevious({ tabbable: true, wrap: true });
          break;
      }
    },
    [focusManager],
  );

  useEffect(() => {
    const element = dialogRef.current;
    if (element) {
      element.addEventListener('keydown', onKeyDown);
    }

    return () => {
      if (element) {
        element.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [onKeyDown]);

  return (
    <AriaDialog
      {...dialogProps}
      ref={dialogRef}
      className={cx(
        'bg-secondary_alt ring-secondary_alt w-66 rounded-xl shadow-lg ring outline-hidden',
        className,
      )}
    >
      <div className="bg-primary ring-secondary rounded-t-xl ring-1">
        <div className="flex flex-col gap-0.5 px-1.5 py-1.5">
          <Button
            aria-label="Toggle theme"
            color="tertiary"
            size="sm"
            iconLeading={theme === 'light' ? Moon01 : Sun}
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          />
        </div>
        <div className="border-secondary flex flex-col gap-0.5 border-t px-3 py-3">
          <AvatarLabelGroup
            status="online"
            size="md"
            initials={getInitials(user?.username ?? '')}
            title={user?.profile?.name ?? ''}
            subtitle={user?.email ?? ''}
          />
        </div>
      </div>

      <div className="pt-1 pb-1.5">
        <NavAccountCardMenuItem
          label="Sign out"
          icon={LogOut01}
          onClick={handleLogout}
        />
      </div>
    </AriaDialog>
  );
};

const NavAccountCardMenuItem = ({
  icon: Icon,
  label,
  shortcut,
  ...buttonProps
}: {
  icon?: FC<{ className?: string }>;
  label: string;
  shortcut?: string;
} & HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...buttonProps}
      className={cx(
        'group/item w-full cursor-pointer px-1.5 focus:outline-hidden',
        buttonProps.className,
      )}
    >
      <div
        className={cx(
          'group-hover/item:bg-primary_hover flex w-full items-center justify-between gap-3 rounded-md p-2',
          'outline-focus-ring group-focus-visible/item:outline-2 group-focus-visible/item:outline-offset-2',
        )}
      >
        <div className="text-secondary group-hover/item:text-secondary_hover flex gap-2 text-sm font-semibold">
          {Icon && <Icon className="text-fg-quaternary size-5" />} {label}
        </div>

        {shortcut && (
          <kbd className="font-body text-tertiary ring-secondary flex rounded px-1 py-px text-xs font-medium ring-1 ring-inset">
            {shortcut}
          </kbd>
        )}
      </div>
    </button>
  );
};

export const NavAccountCard = ({ popoverPlacement }: { popoverPlacement?: Placement }) => {
  const triggerRef = useRef<HTMLDivElement>(null);
  const isDesktop = useBreakpoint('lg');
  const { user } = useAuth();

  // If user data isn't loaded yet, you might want to render nothing or a skeleton
  if (!user) return null;

  return (
    <div
      ref={triggerRef}
      className="ring-secondary relative flex items-center gap-3 rounded-xl p-3 ring-1 ring-inset"
    >
      <AvatarLabelGroup
        size="md"
        initials={getInitials(user.username)}
        title={user.username}
        subtitle={user.email}
        status="online"
      />

      <div className="absolute top-1.5 right-1.5">
        <AriaDialogTrigger>
          <AriaButton className="text-fg-quaternary outline-focus-ring hover:bg-primary_hover hover:text-fg-quaternary_hover pressed:bg-primary_hover pressed:text-fg-quaternary_hover flex cursor-pointer items-center justify-center rounded-md p-1.5 transition duration-100 ease-linear focus-visible:outline-2 focus-visible:outline-offset-2">
            <ChevronSelectorVertical className="size-4 shrink-0" />
          </AriaButton>
          <AriaPopover
            placement={popoverPlacement ?? (isDesktop ? 'right bottom' : 'top right')}
            triggerRef={triggerRef}
            offset={8}
            className={({ isEntering, isExiting }) =>
              cx(
                'origin-(--trigger-anchor-point) will-change-transform',
                isEntering &&
                  'animate-in fade-in placement-right:slide-in-from-left-0.5 placement-top:slide-in-from-bottom-0.5 placement-bottom:slide-in-from-top-0.5 duration-150 ease-out',
                isExiting &&
                  'animate-out fade-out placement-right:slide-out-to-left-0.5 placement-top:slide-out-to-bottom-0.5 placement-bottom:slide-out-to-top-0.5 duration-100 ease-in',
              )
            }
          >
            <NavAccountMenu />
          </AriaPopover>
        </AriaDialogTrigger>
      </div>
    </div>
  );
};

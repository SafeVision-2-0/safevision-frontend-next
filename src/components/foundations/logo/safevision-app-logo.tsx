'use client';

import Image from 'next/image';
import logo from '../../../../public/assets/applogo.svg';
import fullLogoWhite from '../../../../public/assets/logo_white.svg';
import fullLogoBlack from '../../../../public/assets/logo_black.svg';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface Props {
  className?: string;
  full?: boolean;
}

export default function SafevisionAppLogo({ className, full = false }: Props) {
  const { theme } = useTheme();
  const route = useRouter();

  const onLogoCLick = () => {
    route.push('/');
  };

  if (full) {
    return (
      <Image
        src={theme === 'dark' ? fullLogoWhite : fullLogoBlack}
        alt="Logo"
        width={150}
        height={60}
        className={`${className || ''} cursor-pointer`}
        onClick={onLogoCLick}
      />
    );
  }

  return (
    <Image
      src={logo}
      alt="Logo"
      width={40}
      height={40}
      className={`${className || ''} cursor-pointer`}
      onClick={onLogoCLick}
    />
  );
}

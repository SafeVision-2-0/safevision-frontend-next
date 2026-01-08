import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { RouteProvider } from '@/providers/router-provider';
import { Theme } from '@/providers/theme';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'SafeVision',
  description: 'SafeVision App',
};

export const viewport: Viewport = {
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="bg-primary antialiased">
        <RouteProvider>
          <Theme>{children}</Theme>
        </RouteProvider>
      </body>
    </html>
  );
}

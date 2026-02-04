'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/base/buttons/button';
import { Checkbox } from '@/components/base/checkbox/checkbox';
import { Form } from '@/components/base/form/form';
import { Input } from '@/components/base/input/input';
import { BackgroundPattern } from '@/components/shared-assets/background-patterns';
import SafevisionAppLogo from '@/components/foundations/logo/safevision-app-logo';
import { login } from '@/lib/api/auth';
import { useAuth } from '@/contexts/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const data = await login({ email, password });

      // Store token in cookie (expires in 1 day)
      const expires = new Date();
      expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000);
      document.cookie = `token=${data.token}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;

      // 2. Refetch user data immediately so context is updated before redirect
      await refreshUser();

      router.refresh(); // Refresh server components (middleware/server-side checks)
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-primary relative flex min-h-screen flex-col justify-center overflow-hidden px-4 py-12 md:px-8">
      <div className="relative z-10 mx-auto flex w-full flex-col gap-8 sm:max-w-90">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="relative">
            <BackgroundPattern
              pattern="grid"
              className="absolute top-1/2 left-1/2 z-0 hidden -translate-x-1/2 -translate-y-1/2 md:block"
            />
            <BackgroundPattern
              pattern="grid"
              size="md"
              className="absolute top-1/2 left-1/2 z-0 -translate-x-1/2 -translate-y-1/2 md:hidden"
            />
            <SafevisionAppLogo className="relative z-10 w-12 max-md:hidden" />
            <SafevisionAppLogo className="relative z-10 w-10 md:hidden" />
          </div>
          <div className="z-10 flex flex-col gap-2 md:gap-3">
            <h1 className="text-display-xs text-primary md:text-display-sm font-semibold">
              Log in to your account
            </h1>
            <p className="text-md text-tertiary self-stretch p-0">
              Welcome back! Please enter your details.
            </p>
          </div>
        </div>

        <Form onSubmit={handleSubmit} className="z-10 flex flex-col gap-6">
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-5">
            <Input
              isRequired
              hideRequiredIndicator
              label="Email"
              type="email"
              name="email"
              placeholder="Enter your email"
              size="md"
            />
            <Input
              isRequired
              hideRequiredIndicator
              label="Password"
              type="password"
              name="password"
              size="md"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center">
            <Checkbox label="Remember me" name="remember" />
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
}

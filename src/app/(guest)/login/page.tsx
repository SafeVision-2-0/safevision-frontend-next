'use client';

import { TabList, Tabs } from "@/components/application/tabs/tabs";
import { Button } from "@/components/base/buttons/button";
import { SocialButton } from "@/components/base/buttons/social-button";
import { Checkbox } from "@/components/base/checkbox/checkbox";
import { Form } from "@/components/base/form/form";
import { Input } from "@/components/base/input/input";
import { UntitledLogoMinimal } from "@/components/foundations/logo/untitledui-logo-minimal";
import { BackgroundPattern } from "@/components/shared-assets/background-patterns";
import SafevisionAppLogo from '@/components/foundations/logo/safevision-app-logo';


const tabs = [
  { id: "signup", label: "Sign up" },
  { id: "login", label: "Log in" },
];

export default function LoginPage()  {
  return (
    <section className="bg-primary relative flex flex-col justify-center min-h-screen overflow-hidden px-4 py-12 md:px-8">
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

        <Form
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            console.log('Form data:', data);
          }}
          className="z-10 flex flex-col gap-6"
        >
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
            <Button type="submit" size="lg">
              Sign in
            </Button>
          </div>
        </Form>
      </div>
    </section>
  );
};

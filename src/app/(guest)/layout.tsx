'use client';

export default function GuestLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="lg:pl-17">{children}</div>
    </>
  );
}

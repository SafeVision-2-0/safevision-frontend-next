'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { Dot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();

  const people = [
    { label: 'Ikram Sabila', id: '1' },
    { label: 'Halilintar Daiva', id: '2' },
    { label: 'Andra Dzaki', id: '3' },
  ];
  const cameraItems = [
    { label: 'ASUS FHD Camera', id: '1' },
    { label: 'OBS Virtual Camera', id: '2' },
  ];

  const [time, setTime] = useState<Date>(() => new Date());
  const [showColon, setShowColon] = useState<boolean>(true);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // toggle colon every 500ms
  useEffect(() => {
    const id = setInterval(() => setShowColon((s) => !s), 500);
    return () => clearInterval(id);
  }, []);

  const [selectedKey, setSelectedKey] = useState<string>('1');

  // prepare localized hour/minute/dayPeriod parts
  const parts = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(time);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';

  return (
    <Section>
      <div className="flex w-full flex-col gap-8">
        <div className="flex w-full flex-col">
          <Heading className="mb-4">Good Morning, Hal</Heading>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col items-center gap-0 rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
              <h2 className="mb-1 text-4xl font-bold">
                {hour}
                <span className={showColon ? 'mx-1' : 'invisible mx-1'}>:</span>
                {minute}
                {dayPeriod ? <span className="ml-2 text-lg font-normal">{dayPeriod}</span> : null}
              </h2>
              <p>
                {time.toLocaleDateString(undefined, { weekday: 'long' })}
                <br />
                {time.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
              <h2 className="mb-1 text-4xl font-bold">1</h2>
              <p>
                Active Camera.{' '}
                <Link href="/camera" className="underline hover:cursor-pointer">
                  See
                </Link>
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
              <h2 className="mb-1 text-4xl font-bold">6</h2>
              <p>
                Unknown Person Captured Today.{' '}
                <Link href="/captured" className="underline hover:cursor-pointer">
                  See
                </Link>
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
              <h2 className="mb-1 text-4xl font-bold">16</h2>
              <p>
                Verified Person Captured Today.{' '}
                <Link href="/captured" className="underline hover:cursor-pointer">
                  See
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6 items-center rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <img
                src="https://picsum.photos/id/180/300/200"
                alt="Image"
                className="md:col-span-2 aspect-video w-full rounded-lg object-cover"
              />
              <div className="flex h-full flex-col items-end justify-between">
                <div className="w-full">
                  <Select
                    isRequired
                    selectedKey={selectedKey}
                    placeholder="Select Camera"
                    items={cameraItems}
                    onSelectionChange={(key) => setSelectedKey(key as string)}
                  >
                    {(item) => (
                      <Select.Item
                        id={item.id}
                        supportingText={item.supportingText}
                        isDisabled={item.isDisabled}
                        icon={item.icon}
                        avatarUrl={item.avatarUrl}
                      >
                        {item.label}
                      </Select.Item>
                    )}
                  </Select>
                  <div className="mt-4 flex w-full flex-col gap-2">
                    <dl className="flex w-full justify-between gap-1">
                      <dt className="text-gray-500">Unknown Captured</dt>
                      <dd>3</dd>
                    </dl>
                    <dl className="flex w-full justify-between gap-1">
                      <dt className="text-gray-500">Verified Captured</dt>
                      <dd>6</dd>
                    </dl>
                    <dl className="flex w-full justify-between gap-16">
                      <dt className="shrink-0 text-gray-500">Status</dt>
                      <dd className="flex items-center truncate">
                        <Dot className="mt-0.5 text-green-500" />
                        Active
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="w-full md:w-fit pt-4">
                  <Button
                    className="w-full"
                    onClick={() => {
                      router.push('/camera');
                    }}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full gap-0 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <h2 className="text-xl">Most Captured</h2>
              <div className="mt-4 flex w-full flex-col gap-2">
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">
                    Muhammad Ikram Sabila Rasyad
                  </dt>
                  <dd className="text-end">19</dd>
                </dl>
                <hr className="border-gray-200 dark:border-gray-800" />
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">Halilintar Daiva Dirgantara</dt>
                  <dd className="text-end">14</dd>
                </dl>
                <hr className="border-gray-200 dark:border-gray-800" />
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">Muhammad Andra Dzaki</dt>
                  <dd className="text-end">12</dd>
                </dl>
                <hr className="border-gray-200 dark:border-gray-800" />
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">Ghatfan Emery Razan</dt>
                  <dd className="text-end">9</dd>
                </dl>
                <hr className="border-gray-200 dark:border-gray-800" />
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">Unknown</dt>
                  <dd className="text-end">4</dd>
                </dl>
                <hr className="border-gray-200 dark:border-gray-800" />
                <dl className="grid w-full grid-cols-4 gap-1">
                  <dt className="col-span-3 truncate text-gray-500">Zidan Rizki Zulfazli</dt>
                  <dd className="text-end">2</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col">
          <div className="mb-4 flex w-full items-center justify-between">
            <Heading>Captured People</Heading>
            <Link href="/captured" className="hover:cursor-pointer hover:underline">
              See more
            </Link>
          </div>
          <div className="mt-4 grid w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(10)].map((_, i) => (
              <img
                key={i}
                className="aspect-video w-full cursor-pointer rounded-lg object-cover"
                src={`https://picsum.photos/id/${180 + i}/300/200`}
                alt="Person"
              />
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

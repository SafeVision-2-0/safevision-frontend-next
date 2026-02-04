// src/app/(default)/(home)/page.tsx
'use client';

import Section from '@/components/layout/section';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { Dot } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/base/buttons/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getHistory,
  getHistoryCount,
  getMostCaptured,
  HistoryItem,
  MostCapturedData,
} from '@/lib/api/history';
import { buildImageUrl, todaysDate } from '@/lib/helpers/format';
import CapturedDetails from '@/components/custom/captured-details';
import { HomeCameraPreview } from '@/app/(default)/(home)/_components/camera-preview';

const config = {
  HISTORY_LIMIT: 10,
}

export default function Home() {
  const [time, setTime] = useState<Date>(() => new Date());
  const [showColon, setShowColon] = useState<boolean>(true);
  const [isDescOpen, setIsDescOpen] = useState<boolean>(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<HistoryItem | null>(null);

  const [unknownCount, setUnknownCount] = useState<number>(0);
  const [verifiedCount, setVerifiedCount] = useState<number>(0);
  const [mostCaptured, setMostCaptured] = useState<MostCapturedData[]>([]);
  const [capturedHistory, setCapturedHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // toggle colon every 500ms
  useEffect(() => {
    const id = setInterval(() => setShowColon((s) => !s), 500);
    return () => clearInterval(id);
  }, []);

  // Fetch counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [unknownRes, verifiedRes] = await Promise.all([
          getHistoryCount('unknown', todaysDate()),
          getHistoryCount('known', todaysDate()),
        ]);

        if (unknownRes.success) setUnknownCount(unknownRes.data);
        if (verifiedRes.success) setVerifiedCount(verifiedRes.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchCounts();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await getHistory({
          date: todaysDate(),
          limit: config.HISTORY_LIMIT,
        });
        setCapturedHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setCapturedHistory([]);
      }
    };

    fetchHistory();
  }, []);

  // Fetch most captured
  useEffect(() => {
    const fetchMostCaptured = async () => {
      try {
        const res = await getMostCaptured(todaysDate());
        if(res.success) setMostCaptured(res.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };

    fetchMostCaptured();
  }, []);

  const parts = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).formatToParts(time);
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '';
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '';
  const dayPeriod = parts.find((p) => p.type === 'dayPeriod')?.value ?? '';

  const handleHistoryClick = (item: HistoryItem) => {
    setSelectedHistoryItem(item);
    setIsDescOpen(true);
  };

  const handleHistoryClose = () => {
    setSelectedHistoryItem(null);
    setIsDescOpen(false);
  };

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
                {time.toLocaleDateString(undefined, {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
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
              <h2 className="mb-1 text-4xl font-bold">{unknownCount}</h2>
              <p>
                Unknown Person Captured Today.{' '}
                <Link href="/captured" className="underline hover:cursor-pointer">
                  See
                </Link>
              </p>
            </div>
            <div className="flex flex-col items-center gap-0 rounded-xl border border-gray-200 p-6 text-center dark:border-gray-800">
              <h2 className="mb-1 text-4xl font-bold">{verifiedCount}</h2>
              <p>
                Verified Person Captured Today.{' '}
                <Link href="/captured" className="underline hover:cursor-pointer">
                  See
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">

            {/*camera part*/}
            <HomeCameraPreview />

            <div className="flex w-full flex-col gap-0 rounded-xl border border-gray-200 p-6 dark:border-gray-800">
              <h2 className="text-xl">Most Captured Today</h2>
              <div className="mt-4 flex w-full flex-col gap-2">
                {mostCaptured.length === 0 ? (
                  <p className="text-center">No data available</p>
                ) : (
                  mostCaptured.map((item, i) => (
                    <>
                      <dl className="grid w-full grid-cols-4 gap-1">
                        <dt className="col-span-3 truncate text-gray-500">{item.profileName}</dt>
                        <dd className="text-end">{item.count}</dd>
                      </dl>
                      {i === mostCaptured.length - 1 ? null : (
                        <hr className="border-gray-200 dark:border-gray-800" />
                      )}
                    </>
                  ))
                )}
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
            {capturedHistory.length === 0
              ? 'No captures found'
              : capturedHistory.map((item) => (
                  <img
                    key={item.id}
                    className="aspect-video w-full cursor-pointer rounded-lg object-cover"
                    src={buildImageUrl(item.imageCaptured)}
                    alt="Captured Person"
                    onClick={() => handleHistoryClick(item)}
                  />
                ))}
          </div>
        </div>
      </div>

      <CapturedDetails
        isDescOpen={isDescOpen}
        setIsDescOpen={setIsDescOpen}
        item={selectedHistoryItem}
        onClose={handleHistoryClose}
      />
    </Section>
  );
}

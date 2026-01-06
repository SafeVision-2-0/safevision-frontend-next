'use client';

import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';

const cameraItems = [
  { label: 'ASUS FHD Camera', id: '1' },
  { label: 'OBS Virtual Camera', id: '2' },
];

export function LiveCamera() {
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    startCamera();

    // Cleanup: stop camera when component unmounts
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex-1">
      <Heading className="mb-4">Live Camera</Heading>

      <div className="flex w-full items-center justify-between">
        <Select
          isRequired
          selectedKey={selectedKey}
          placeholder="Select team member"
          items={cameraItems}
          className="w-64"
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

        <span className="text-2xl">03.01:00 PM</span>
      </div>

      <div className="mt-4">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full rounded-lg object-cover"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="mt-4 flex w-full flex-col gap-2">
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Camera Alias</dt>
            <dd>Main Camera</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Camera Name</dt>
            <dd>ASUS FHD Camera</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-16">
            <dt className="shrink-0 text-gray-500">Device ID</dt>
            <dd className="truncate">vFe1EMquVUzOJGjWCXQLHiYRtDvFe1EMquVUzOJGjWCXQLHiYRtD</dd>
          </dl>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2">
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Width</dt>
            <dd>640 px</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Height</dt>
            <dd>480 px</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Frame Rate</dt>
            <dd className="truncate">30 fps</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

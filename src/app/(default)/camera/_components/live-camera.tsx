'use client';

import { useEffect, useState } from 'react';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { useCameraStream } from '@/hooks/use-camera-stream';

interface LiveCameraProps {
  onHistorySent?: () => void;
}

export function LiveCamera({ onHistorySent }: LiveCameraProps) {
  const [currentTime, setCurrentTime] = useState('');

  const { videoRef, overlayRef, cameras, cameraStats, selectedDeviceId, setSelectedDeviceId } =
    useCameraStream({ onHistorySent });

  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }),
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1">
      <Heading className="mb-4">Live Camera</Heading>
      <div className="flex w-full items-center justify-between">
        <Select
          isRequired
          selectedKey={selectedDeviceId || ''}
          placeholder="Select camera"
          items={cameras}
          className="w-64"
          onSelectionChange={(key) => setSelectedDeviceId(key as string)}
        >
          {(item) => (
            <Select.Item id={item.id} textValue={item.label}>
              {item.label}
            </Select.Item>
          )}
        </Select>

        <span className="font-variant-numeric text-2xl tabular-nums">
          {currentTime || '--:--:-- --'}
        </span>
      </div>

      <div className="relative mt-4 w-full">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full rounded-lg bg-black/10"
        />
        <canvas
          ref={overlayRef}
          className="pointer-events-none absolute top-0 left-0 h-full w-full"
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
            <dd className="max-w-[200px] truncate" title={cameraStats.label}>
              {cameraStats.label || '-'}
            </dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-16">
            <dt className="shrink-0 text-gray-500">Device ID</dt>
            <dd className="truncate text-right" title={cameraStats.deviceId}>
              {cameraStats.deviceId || '-'}
            </dd>
          </dl>
        </div>
        <div className="mt-4 flex w-full flex-col gap-2">
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Width</dt>
            <dd>{cameraStats.width > 0 ? `${cameraStats.width} px` : '-'}</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Height</dt>
            <dd>{cameraStats.height > 0 ? `${cameraStats.height} px` : '-'}</dd>
          </dl>
          <hr className="border-gray-200 dark:border-gray-800" />
          <dl className="flex w-full justify-between gap-1">
            <dt className="text-gray-500">Frame Rate</dt>
            <dd>{cameraStats.frameRate > 0 ? `${cameraStats.frameRate} fps` : '-'}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}

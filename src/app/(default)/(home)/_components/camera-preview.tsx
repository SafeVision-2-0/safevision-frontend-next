// src/components/custom/home-camera-preview.tsx
'use client';

import { Select } from '@/components/base/select/select';
import { Button } from '@/components/base/buttons/button';
import { Dot } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCameraStream } from '@/hooks/use-camera-stream';

interface HomeCameraPreviewProps {
  onHistorySent?: () => void;
}

export function HomeCameraPreview({ onHistorySent }: HomeCameraPreviewProps) {
  const router = useRouter();

  const {
    videoRef,
    overlayRef,
    cameras,
    cameraStats,
    selectedDeviceId,
    setSelectedDeviceId,
    isConnected,
  } = useCameraStream({ onHistorySent });

  return (
    <div className="grid grid-cols-1 items-center gap-6 rounded-xl border border-gray-200 p-6 md:grid-cols-3 lg:col-span-3 dark:border-gray-800">
      <div className="relative aspect-video w-full md:col-span-2">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="aspect-video w-full rounded-lg bg-black/10 object-cover"
        />
        <canvas
          ref={overlayRef}
          className="pointer-events-none absolute top-0 left-0 h-full w-full"
        />
      </div>
      <div className="flex h-full flex-col items-end justify-between">
        <div className="w-full">
          <Select
            isRequired
            selectedKey={selectedDeviceId || ''}
            placeholder="Select Camera"
            items={cameras}
            onSelectionChange={(key) => setSelectedDeviceId(key as string)}
          >
            {(item) => (
              <Select.Item id={item.id} textValue={item.label}>
                {item.label}
              </Select.Item>
            )}
          </Select>

          <div className="mt-4 flex w-full flex-col gap-2">
            <dl className="flex w-full justify-between gap-1">
              <dt className="text-gray-500">Width</dt>
              <dd>{cameraStats.width > 0 ? `${cameraStats.width} px` : '-'}</dd>
            </dl>
            <dl className="flex w-full justify-between gap-1">
              <dt className="text-gray-500">Height</dt>
              <dd>{cameraStats.height > 0 ? `${cameraStats.height} px` : '-'}</dd>
            </dl>
            <dl className="flex w-full justify-between gap-1">
              <dt className="text-gray-500">Frame Rate</dt>
              <dd>{cameraStats.frameRate > 0 ? `${cameraStats.frameRate} fps` : '-'}</dd>
            </dl>
            <dl className="flex w-full justify-between gap-16">
              <dt className="shrink-0 text-gray-500">Status</dt>
              <dd className="flex items-center truncate">
                <Dot className={`mt-0.5 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                {isConnected ? 'Active' : 'Disconnected'}
              </dd>
            </dl>
          </div>
        </div>
        <div className="w-full pt-4 md:w-fit">
          <Button className="w-full" onClick={() => router.push('/camera')}>
            Detail
          </Button>
        </div>
      </div>
    </div>
  );
}

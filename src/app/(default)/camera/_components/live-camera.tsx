'use client';

import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';
import { createHistory } from '@/lib/api/history';

const cameraItems = [
  { label: 'ASUS FHD Camera', id: '1' },
  { label: 'OBS Virtual Camera', id: '2' },
];

type Detection = {
  track_id: number;
  name: string;
  bbox: [number, number, number, number];
  profile_id?: number;
};

type CaptureState = {
  profileId: number;
  firstSeen: number;
  lastSeen: number;
  lastCaptured: number;
  captureCount: number;
  sessionActive: boolean;
};

const CAPTURE_CONFIG = {
  MIN_DURATION: 1000, // Minimum 1 second visible before first capture
  SESSION_TIMEOUT: 60000, // 1 minute - time before considering it a new session
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_CAPTURES_PER_SESSION: 1, // Capture only once per session
};

export function LiveCamera() {
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const [detections, setDetections] = useState<Detection[]>([]);
  const captureStateRef = useRef<Map<number, CaptureState>>(new Map());

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_BASE_WEBSOCKET}/ws/face-recognition/vggface2`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');

      intervalRef.current = setInterval(() => {
        if (ws.bufferedAmount === 0) {
          captureAndSendFrame();
        }
      }, 500);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.detections) {
          setDetections(response.detections);
          processDetectionsForCapture(response.detections);
        }
      } catch (e) {
        console.error('Error parsing WebSocket message', e);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
      console.log('WebSocket closed by server');
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const processDetectionsForCapture = async (detections: Detection[]) => {
    const now = Date.now();
    const currentProfileIds = new Set(
      detections.filter((d) => d.profile_id).map((d) => d.profile_id!),
    );

    // Clean up state for persons no longer detected
    for (const [profileId, state] of captureStateRef.current) {
      if (!currentProfileIds.has(profileId)) {
        // Just mark as inactive. Do NOT update lastSeen here, so we preserve
        // the timestamp of when they actually disappeared.
        state.sessionActive = false;
      }
    }

    // Process each detection
    for (const detection of detections) {
      const { profile_id } = detection;

      // Skip unknown persons (no profile_id)
      if (!profile_id) continue;

      let state = captureStateRef.current.get(profile_id);

      if (!state) {
        // First time seeing this person
        state = {
          profileId: profile_id,
          firstSeen: now,
          lastSeen: now,
          lastCaptured: 0,
          captureCount: 0,
          sessionActive: true,
        };
        captureStateRef.current.set(profile_id, state);
      } else {
        // Person Exists

        // If they were inactive (absent), check how long they were gone.
        if (!state.sessionActive) {
          const timeSinceLastSeen = now - state.lastSeen;

          // If gone longer than timeout, treat as NEW session
          if (timeSinceLastSeen >= CAPTURE_CONFIG.SESSION_TIMEOUT) {
            state.firstSeen = now;
            state.captureCount = 0; // Reset count to allow new capture
            state.lastCaptured = 0;
            // console.log(
            //   `New session started for profile ${profile_id} (away for ${timeSinceLastSeen}ms)`,
            // );
          }
          // Else: reappeared quickly (< 1 min). The old session continues.
          // captureCount is preserved, so if we already captured, we won't capture again.
        }

        // Always update presence
        state.sessionActive = true;
        state.lastSeen = now;
      }

      // Check if we should capture this detection
      const shouldCapture = evaluateCaptureConditions(state, now);

      if (shouldCapture) {
        try {
          await capturePersonToBackend(detection);

          // Update capture state
          state.lastCaptured = now;
          state.captureCount += 1;

          // console.log(
          //   `Captured person ${detection.name} (profile_id: ${profile_id}, session: ${state.captureCount})`,
          // );
        } catch (error) {
          console.error('Failed to capture person:', error);
        }
      }
    }
  };

  const evaluateCaptureConditions = (state: CaptureState, now: number): boolean => {
    // Rule: Don't exceed max captures per session (Configured to 1)
    if (state.captureCount >= CAPTURE_CONFIG.MAX_CAPTURES_PER_SESSION) {
      return false;
    }

    // Rule: Must be visible for minimum duration before capture
    return now - state.firstSeen >= CAPTURE_CONFIG.MIN_DURATION;
  };

  const capturePersonToBackend = async (detection: Detection) => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error('Video or canvas not available');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      throw new Error('Invalid video dimensions');
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Draw current frame
    ctx.drawImage(video, 0, 0);

    // Convert to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        'image/jpeg',
        0.85,
      );
    });

    // Determine if unknown person
    const isUnknown = !detection.profile_id || detection.name.toLowerCase().includes('unknown');

    // Send to backend API
    await createHistory({
      file: blob,
      isUnknown,
      profileId: isUnknown ? undefined : detection.profile_id,
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayRef.current;

    if (!video || !canvas) return;

    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6';
    ctx.font = 'bold 16px sans-serif';
    ctx.textBaseline = 'top';

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      ctx.strokeRect(x1, y1, width, height);

      const name = det.name.replace(/\.(jpeg|jpg|png)$/i, '');
      const textPadding = 4;
      const textWidth = ctx.measureText(name).width;
      const textHeight = 20;

      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x1, y1 - textHeight - 4, textWidth + textPadding * 2, textHeight + 4);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, x1 + textPadding, y1 - textHeight - 2);
    });
  }, [detections]);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const reader = new FileReader();
        reader.onloadend = () => {
          const res = reader.result as string;
          if (!res) return;
          const base64String = res.split(',')[1];

          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(
              JSON.stringify({
                frame: base64String,
              }),
            );
          }
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.8,
    );
  };

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

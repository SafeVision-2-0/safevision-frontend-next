'use client';

import { useEffect, useRef, useState } from 'react';
import Heading from '@/components/layout/heading';
import { Select } from '@/components/base/select/select';

const cameraItems = [
  { label: 'ASUS FHD Camera', id: '1' },
  { label: 'OBS Virtual Camera', id: '2' },
];

type Detection = {
  track_id: number;
  name: string;
  bbox: [number, number, number, number]; // [x1, y1, x2, y2]
};

export function LiveCamera() {
  const [selectedKey, setSelectedKey] = useState<string>('1');
  const [detections, setDetections] = useState<Detection[]>([]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); // For capturing frames
  const overlayRef = useRef<HTMLCanvasElement>(null); // For drawing bounding boxes
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

    // Connect to WebSocket
    const ws = new WebSocket('ws://10.200.115.20:8000/ws/face-recognition');
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');

      // Start sending frames.
      // CHANGED: Increased interval to 200ms (5 FPS) to prevent overwhelming the backend
      // Previous: 30ms (~33 FPS) -> Caused backlog/lag
      intervalRef.current = setInterval(() => {
        // Optional: Check if WebSocket is busy sending data
        if (ws.bufferedAmount === 0) {
          captureAndSendFrame();
        }
        console.log('captured');
      }, 500);
    };

    ws.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);
        if (response.detections) {
          setDetections(response.detections);
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

    // Cleanup: stop camera and WebSocket when component unmounts
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

  // Draw bounding boxes when detections change
  useEffect(() => {
    const video = videoRef.current;
    const canvas = overlayRef.current;

    if (!video || !canvas) return;

    // Ensure canvas matches video internal resolution for correct coordinate mapping
    if (video.videoWidth > 0 && video.videoHeight > 0) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Style configuration
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#3b82f6'; // Blue color
    ctx.font = 'bold 16px sans-serif';
    ctx.textBaseline = 'top';

    detections.forEach((det) => {
      const [x1, y1, x2, y2] = det.bbox;
      const width = x2 - x1;
      const height = y2 - y1;

      // Draw Bounding Box
      ctx.strokeRect(x1, y1, width, height);

      // Prepare text
      const name = det.name.replace(/\.(jpeg|jpg|png)$/i, '');
      const textPadding = 4;
      const textWidth = ctx.measureText(name).width;
      const textHeight = 20;

      // Draw Text Background
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(x1, y1 - textHeight - 4, textWidth + (textPadding * 2), textHeight + 4);

      // Draw Text
      ctx.fillStyle = '#ffffff';
      ctx.fillText(name, x1 + textPadding, y1 - textHeight - 2);
    });
  }, [detections]);

  const captureAndSendFrame = () => {
    if (!videoRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return;
    }

    // Create canvas if not exists
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;

    // Ensure we capture valid dimensions
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Convert canvas to base64 JPEG (similar to cv2.imencode)
    canvas.toBlob((blob) => {
      if (!blob) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        if (!res) return;
        const base64String = res.split(',')[1];

        // Send frame to WebSocket
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({
            frame: base64String
          }));
        }
      };
      reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.80); // Reduced quality slightly to 0.8 to speed up transmission
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

        {/* Video Wrapper with Relative positioning for Overlay */}
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
              className="pointer-events-none absolute left-0 top-0 h-full w-full"
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

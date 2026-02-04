// src/hooks/use-camera-stream.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { createHistory } from '@/lib/api/history';

export type Detection = {
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

export type CameraStats = {
  label: string;
  deviceId: string;
  width: number;
  height: number;
  frameRate: number;
};

export type CameraDevice = {
  label: string;
  id: string;
};

const CAPTURE_CONFIG = {
  MIN_DURATION: 1000,
  SESSION_TIMEOUT: 60000,
  UNKNOWN_PROFILE_SESSION_TIMEOUT: 3000,
  CONFIDENCE_THRESHOLD: 0.7,
  MAX_CAPTURES_PER_SESSION: 1,
};

const UNKNOWN_PROFILE_ID = -1;

export interface UseCameraStreamOptions {
  onHistorySent?: () => void;
  autoConnect?: boolean;
}

export function useCameraStream(options: UseCameraStreamOptions = {}) {
  const { onHistorySent, autoConnect = true } = options;

  const [detections, setDetections] = useState<Detection[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraDevice[]>([]);
  const [cameraStats, setCameraStats] = useState<CameraStats>({
    label: '',
    deviceId: '',
    width: 0,
    height: 0,
    frameRate: 0,
  });
  const [isConnected, setIsConnected] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const captureStateRef = useRef<Map<number, CaptureState>>(new Map());

  // Camera setup
  useEffect(() => {
    if (!autoConnect) return;

    let mounted = true;

    async function setupCamera() {
      try {
        if (videoRef.current?.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach((track) => track.stop());
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: selectedDeviceId ? { deviceId: { exact: selectedDeviceId } } : true,
        });

        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        const videoTrack = stream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();

        setCameraStats({
          label: videoTrack.label || 'Unknown Camera',
          deviceId: settings.deviceId || '',
          width: settings.width || 0,
          height: settings.height || 0,
          frameRate: settings.frameRate || 0,
        });

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({
            label: d.label || `Camera ${d.deviceId.slice(0, 5)}...`,
            id: d.deviceId,
          }));

        setCameras(videoInputs);

        if (!selectedDeviceId && settings.deviceId) {
          setSelectedDeviceId(settings.deviceId);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }

    setupCamera();

    return () => {
      mounted = false;
    };
  }, [selectedDeviceId, autoConnect]);

  const captureAndSendFrame = useCallback(() => {
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
            wsRef.current.send(JSON.stringify({ frame: base64String }));
          }
        };
        reader.readAsDataURL(blob);
      },
      'image/jpeg',
      0.8,
    );
  }, []);

  const capturePersonToBackend = useCallback(
    async (detection: Detection) => {
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

      ctx.drawImage(video, 0, 0);

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

      const isUnknown = !detection.profile_id || detection.name.toLowerCase().includes('unknown');

      await createHistory({
        file: blob,
        isUnknown,
        profileId: isUnknown ? undefined : detection.profile_id,
      });

      onHistorySent?.();
    },
    [],
  );

  const evaluateCaptureConditions = useCallback((state: CaptureState, now: number): boolean => {
    if (state.captureCount >= CAPTURE_CONFIG.MAX_CAPTURES_PER_SESSION) {
      return false;
    }
    return now - state.firstSeen >= CAPTURE_CONFIG.MIN_DURATION;
  }, []);

  const processDetectionsForCapture = useCallback(
    async (detections: Detection[]) => {
      const now = Date.now();
      const currentProfileIds = new Set(detections.map((d) => d.profile_id ?? UNKNOWN_PROFILE_ID));

      for (const [profileId, state] of captureStateRef.current) {
        if (!currentProfileIds.has(profileId)) {
          state.sessionActive = false;
        }
      }

      for (const detection of detections) {
        const profile_id = detection.profile_id ?? UNKNOWN_PROFILE_ID;

        let state = captureStateRef.current.get(profile_id);

        if (!state) {
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
          if (!state.sessionActive) {
            const timeSinceLastSeen = now - state.lastSeen;
            const timeoutThreshold = profile_id === UNKNOWN_PROFILE_ID
              ? CAPTURE_CONFIG.UNKNOWN_PROFILE_SESSION_TIMEOUT
              : CAPTURE_CONFIG.SESSION_TIMEOUT;

            if (timeSinceLastSeen >= timeoutThreshold) {
              state.firstSeen = now;
              state.captureCount = 0;
              state.lastCaptured = 0;
            }
          }

          state.sessionActive = true;
          state.lastSeen = now;
        }

        const shouldCapture = evaluateCaptureConditions(state, now);

        if (shouldCapture) {
          try {
            await capturePersonToBackend(detection);
            state.lastCaptured = now;
            state.captureCount += 1;
          } catch (error) {
            console.error('Failed to capture person:', error);
          }
        }
      }
    },
    [capturePersonToBackend, evaluateCaptureConditions],
  );

  // WebSocket connection
  useEffect(() => {
    if (!autoConnect) return;

    const ws = new WebSocket(
      `${process.env.NEXT_PUBLIC_BASE_WEBSOCKET}/ws/face-recognition/vggface2`,
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to WebSocket');
      setIsConnected(true);
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
      setIsConnected(false);
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (wsRef.current?.readyState === WebSocket.OPEN) wsRef.current.close();

      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [autoConnect, captureAndSendFrame, processDetectionsForCapture]);

  // Draw bounding boxes
  const drawOverlay = useCallback(() => {
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

  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  return {
    // Refs
    videoRef,
    canvasRef,
    overlayRef,
    // State
    detections,
    cameras,
    cameraStats,
    selectedDeviceId,
    isConnected,
    // Actions
    setSelectedDeviceId,
  };
}

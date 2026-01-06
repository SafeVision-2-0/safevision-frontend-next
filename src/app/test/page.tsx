'use client';

import { useEffect, useState } from 'react';

type CameraInfo = {
  deviceId: string;
  label: string;
  groupId: string;
};

export default function CameraInspector() {
  const [cameras, setCameras] = useState<CameraInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [trackInfo, setTrackInfo] = useState<any>(null);

  // 1. Get available cameras
  useEffect(() => {
    async function loadDevices() {
      // Ask permission first
      await navigator.mediaDevices.getUserMedia({ video: true });

      const devices = await navigator.mediaDevices.enumerateDevices();

      const videoDevices = devices
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          label: d.label,
          groupId: d.groupId,
        }));

      setCameras(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    }

    loadDevices();
  }, []);

  // 2. Start camera when device changes
  useEffect(() => {
    async function startCamera() {
      if (!selectedDeviceId) return;

      // Stop previous stream
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: selectedDeviceId } },
      });

      setStream(newStream);

      const video = document.getElementById('video') as HTMLVideoElement;
      if (video) {
        video.srcObject = newStream;
      }

      const track = newStream.getVideoTracks()[0];

      setTrackInfo({
        settings: track.getSettings(),
        capabilities: track.getCapabilities?.(),
        constraints: track.getConstraints(),
        label: track.label,
        readyState: track.readyState,
        muted: track.muted,
      });
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [selectedDeviceId]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Camera Inspector (videoinput)</h2>

      {/* Camera selector */}
      <label>
        Select Camera:
        <select
          value={selectedDeviceId ?? ''}
          onChange={(e) => setSelectedDeviceId(e.target.value)}
        >
          {cameras.map((cam) => (
            <option key={cam.deviceId} value={cam.deviceId}>
              {cam.label || 'Unknown camera'}
            </option>
          ))}
        </select>
      </label>

      {/* Video preview */}
      <div style={{ marginTop: 16 }}>
        <video id="video" autoPlay playsInline muted style={{ width: 400, background: '#000' }} />
      </div>

      {/* Raw device info */}
      <h3>Enumerated Device Info</h3>
      <pre>{JSON.stringify(cameras, null, 2)}</pre>

      {/* Track info */}
      <h3>Active Video Track Info</h3>
      {trackInfo ? <pre>{JSON.stringify(trackInfo, null, 2)}</pre> : <p>No active track</p>}
    </div>
  );
}

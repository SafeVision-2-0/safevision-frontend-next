import { ImageResponse } from '@/types/image';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface CreateHistoryPayload {
  file: Blob;
  isUnknown: boolean;
  profileId?: number;
}

export async function createHistory(payload: CreateHistoryPayload): Promise<ImageResponse> {
  const formData = new FormData();
  formData.append('file', payload.file, 'capture.jpg');
  formData.append('isUnknown', String(payload.isUnknown));

  if (payload.profileId !== undefined) {
    formData.append('profileId', String(payload.profileId));
  }

  const response = await fetch(`${BASE_URL}/history/`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to create history: ${response.statusText}`);
  }

  return response.json();
}

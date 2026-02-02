// src/lib/api/history.ts
import { ImageResponse } from '@/types/image';
import { Meta } from '@/types/global';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export interface CreateHistoryPayload {
  file: Blob;
  isUnknown: boolean;
  profileId?: number;
}

export interface HistoryItem {
  id: number;
  imageCaptured: string;
  profileId?: number;
  isUnknown: boolean;
  created_at: string;
  profile?: {
    id: number;
    name: string;
  };
}

export interface HistoryResponse {
  success: boolean;
  data: HistoryItem[];
  meta: Meta;
}

export interface GetHistoryParams {
  page?: number;
  limit?: number;
  status?: 'unknown' | 'known';
  profileId?: number;
  date?: string; // Format: YYYY-MM-DD
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

export async function getHistory(params: GetHistoryParams = {}): Promise<HistoryResponse> {
  const queryParams = new URLSearchParams();

  if (params.page) queryParams.append('page', String(params.page));
  if (params.limit) queryParams.append('limit', String(params.limit));
  if (params.status) queryParams.append('status', params.status);
  if (params.profileId) queryParams.append('profileId', String(params.profileId));
  if (params.date) queryParams.append('date', params.date);

  const response = await fetch(`${BASE_URL}/history/?${queryParams.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch history: ${response.statusText}`);
  }

  return response.json();
}

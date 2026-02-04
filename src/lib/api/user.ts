import { Profiler } from 'inspector';
import { Person } from '@/types/person';

export interface User {
  id: number;
  email: string;
  username: string;
  profile: Person;
  created_at: string;
  updated_at: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data: User[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

function getToken(): string | undefined {
  if (typeof document === 'undefined') return undefined; // Server-side safety
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith('token='))
    ?.split('=')[1];
}

export async function getMe(): Promise<User | null> {
  const token = getToken();

  if (!token) return null;

  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const result: User = await response.json();
  return result || null;
}

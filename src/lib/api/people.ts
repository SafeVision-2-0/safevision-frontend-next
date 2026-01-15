import { PersonResponse } from '@/types/person';

export async function getPeople(page: number = 1, limit: number = 10): Promise<PersonResponse> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/person?page=${page}&limit=${limit}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch people');
  }

  return res.json();
}

export interface CreatePersonPayload {
  name: string;
  gender: string;
  birth: string;
}

export async function createPerson(
  data: CreatePersonPayload,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to create person');
  }

  return res.json();
}

export async function deletePerson(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete person');
  }

  return res.json();
}

export async function updatePerson(
  id: string,
  data: CreatePersonPayload,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Failed to update person');
  }

  return res.json();
}

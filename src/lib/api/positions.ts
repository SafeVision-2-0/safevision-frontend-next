import { PositionResponse } from '@/types/position';

export async function getPositions(
  page: number = 1,
  limit: number = 10,
): Promise<PositionResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/positions?page=${page}&limit=${limit}`,
    {
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    throw new Error('Failed to fetch positions');
  }

  return res.json();
}

export async function createPosition(name: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error('Failed to create position');
  }

  return res.json();
}

export async function deletePosition(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete position');
  }

  return res.json();
}

export async function updatePosition(
  id: string,
  name: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/positions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error('Failed to update position');
  }

  return res.json();
}

export async function assignPosition(
  positionId: number,
  profileId: number,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile-position`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ positionId, profileId }),
  });

  return res.json();
}

export async function unassignPosition(
  positionId: number,
  profileId: number,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile-position/${profileId}/${positionId}`, {
    method: 'DELETE',
  });

  return res.json();
}

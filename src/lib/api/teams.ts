import { TeamResponse } from '@/types/team';

export async function getTeams(page: number = 1, limit: number = 10): Promise<TeamResponse> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/teams?page=${page}&limit=${limit}`,
    {
      cache: 'no-store',
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch teams');
  }

  return res.json();
}

export async function createTeam(name: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error('Failed to create team');
  }

  return res.json();
}

export async function deleteTeam(id: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Failed to delete team');
  }

  return res.json();
}

export async function updateTeam(id: string, name: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teams/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!res.ok) {
    throw new Error('Failed to update team');
  }

  return res.json();
}

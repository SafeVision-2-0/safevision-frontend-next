export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'; // Replace with your actual API URL or env var

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to login');
  }

  return response.json();
}

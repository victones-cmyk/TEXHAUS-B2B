const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setToken(token: string | null) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers as Record<string, string>),
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `Erro ${res.status}`);
  }

  return data as T;
}

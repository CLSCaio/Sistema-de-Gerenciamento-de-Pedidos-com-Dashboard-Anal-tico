import type { ApiErrorBody } from '@/types/api';

const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;
let unauthorizedHandler: (() => void) | null = null;

export class ApiError extends Error {
  readonly status: number;
  readonly details: Array<{ field: string; message: string }>;

  constructor(status: number, message: string, details: Array<{ field: string; message: string }> = []) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

  const response = await fetch(`${baseUrl}${path}`, { ...init, headers, credentials: 'include' });
  if (response.status === 401 && retry && !path.startsWith('/api/auth/')) {
    const renewed = await refreshAccessToken();
    if (!renewed) {
      unauthorizedHandler?.();
      throw new ApiError(401, 'Sessão expirada');
    }
    return api<T>(path, init, false);
  }

  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json();
  if (!response.ok) {
    const body = isErrorBody(payload) ? payload : null;
    throw new ApiError(response.status, body?.error.message ?? 'Falha na requisição', body?.error.details ?? []);
  }
  return payload as T;
}

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = requestRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function requestRefresh(): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${baseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    });
    if (!response.ok) {
      accessToken = null;
      return null;
    }
    const payload: unknown = await response.json();
    if (!isSession(payload)) return null;
    accessToken = payload.accessToken;
    return payload.accessToken;
  } catch {
    accessToken = null;
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function isErrorBody(value: unknown): value is ApiErrorBody {
  if (typeof value !== 'object' || value === null || !('error' in value)) return false;
  const error = (value as { error?: unknown }).error;
  return typeof error === 'object' && error !== null && 'message' in error;
}

function isSession(value: unknown): value is { accessToken: string } {
  return typeof value === 'object' && value !== null && 'accessToken' in value && typeof value.accessToken === 'string';
}

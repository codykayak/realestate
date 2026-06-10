import Constants from 'expo-constants';
import { getStoredItem, setStoredItem } from './storage';

const API_URL_KEY = 'code_on_go_api_url';

const DEFAULT_API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:8080';

let apiBaseUrlOverride: string | null = null;

/** Resolved API root (no trailing slash). */
export function getApiBaseUrl(): string {
  const raw = apiBaseUrlOverride ?? DEFAULT_API_BASE_URL;
  return raw.replace(/\/$/, '');
}

export async function loadApiBaseUrl(): Promise<string> {
  const stored = await getStoredItem(API_URL_KEY);
  if (stored?.trim()) {
    apiBaseUrlOverride = stored.trim().replace(/\/$/, '');
  }
  return getApiBaseUrl();
}

export async function saveApiBaseUrl(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/$/, '');
  apiBaseUrlOverride = trimmed;
  await setStoredItem(API_URL_KEY, trimmed);
}

export async function testApiConnection(): Promise<{ ok: boolean; message: string }> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}/health`, { method: 'GET' });
    if (!res.ok) {
      return { ok: false, message: `API at ${base} returned ${res.status}` };
    }
    const body = await res.json().catch(() => ({}));
    if (body?.ok) {
      return { ok: true, message: `Connected to ${base}` };
    }
    return { ok: false, message: `Unexpected response from ${base}` };
  } catch {
    return {
      ok: false,
      message: `Cannot reach ${base}. Start the backend: cd code-on-go && npm run dev:backend`,
    };
  }
}

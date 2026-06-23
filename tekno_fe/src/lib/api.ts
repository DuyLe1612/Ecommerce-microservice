// Lightweight fetch helper with JWT bearer support
// Usage: import { get, post, put, del, postForm, setAuthToken, getAuthToken, API_BASE } from '@/lib/api'
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const AUTH_TOKEN_KEY = 'token';

export function setAuthToken(token?: string | null) {
  if (!token) {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } else {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY) || undefined;
}

async function request(url: string, opts: RequestInit = {}) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  // If we have a token, add Authorization header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is not FormData and Content-Type not provided, default to JSON
  const body = opts.body as any;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isForm && body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, { ...opts, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
    // attach status to error for caller convenience
    (err as any).status = res.status;

    if (res.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-expired"));
    }

    throw err;
  }

  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return res.text();
}

export async function get(url: string, opts?: RequestInit) {
  return request(url, { method: 'GET', ...opts });
}

export async function post(url: string, body?: any, opts?: RequestInit) {
  const init: RequestInit = { method: 'POST', ...opts };
  if (body instanceof FormData) {
    init.body = body;
  } else if (body !== undefined) {
    init.body = JSON.stringify(body);
  }
  return request(url, init);
}

export async function postForm(url: string, formData: FormData, opts?: RequestInit) {
  return request(url, { method: 'POST', body: formData, ...opts });
}

export async function put(url: string, body?: any, opts?: RequestInit) {
  const init: RequestInit = { method: 'PUT', ...opts };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) init.body = JSON.stringify(body);
  return request(url, init);
}

export async function putForm(url: string, formData: FormData, opts?: RequestInit) {
  return request(url, { method: 'PUT', body: formData, ...opts });
}

export async function del(url: string, opts?: RequestInit) {
  return request(url, { method: 'DELETE', ...opts });
}

export async function patchForm(url: string, formData: FormData, opts?: RequestInit) {
  return request(url, { method: 'PATCH', body: formData, ...opts });
}

export async function patch(url: string, body?: any, opts?: RequestInit) {
  const init: RequestInit = { method: 'PATCH', ...opts };
  if (body instanceof FormData) init.body = body;
  else if (body !== undefined) init.body = JSON.stringify(body);
  return request(url, init);
}

export default {
  get,
  post,
  postForm,
  put,
  putForm,
  patch,
  patchForm,
  del,
  setAuthToken,
  getAuthToken,
};

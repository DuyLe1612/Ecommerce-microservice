// Lightweight fetch helper with JWT bearer support and automatic token refresh
// Usage: import { get, post, put, del, postForm, setAuthToken, getAuthToken, API_BASE } from '@/lib/api'

import { refreshTokenApi, logoutApi } from '@/services/auth';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const AUTH_TOKEN_KEY = 'token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

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

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
}

export function setRefreshToken(token?: string | null) {
  if (!token) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

async function handleTokenRefresh() {
  if (isRefreshing) {
    return refreshPromise;
  }

  isRefreshing = true;
  
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await refreshTokenApi(refreshToken);
    
    if (response.access_token) {
      setAuthToken(response.access_token);
      if (response.refresh_token) {
        setRefreshToken(response.refresh_token);
      }
    }
  } catch (error) {
    clearAuthTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw error;
  } finally {
    isRefreshing = false;
    refreshPromise = null;
  }
}

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

async function request(url: string, opts: RequestInit = {}, retry = true) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    ...(opts.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = opts.body as any;
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData;
  if (!isForm && body != null && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(url, { ...opts, headers });

    if (res.status === 401 && retry) {
      try {
        await handleTokenRefresh();
        const newToken = getAuthToken();
        if (newToken) {
          headers['Authorization'] = `Bearer ${newToken}`;
          const retryRes = await fetch(url, { ...opts, headers });
          
          if (retryRes.ok) {
            const contentType = retryRes.headers.get('content-type') || '';
            if (contentType.includes('application/json')) {
              return retryRes.json();
            }
            return retryRes.text();
          }
          
          if (retryRes.status === 401) {
            clearAuthTokens();
            window.dispatchEvent(new CustomEvent('auth-expired'));
            const err = new Error('Session expired');
            (err as any).status = 401;
            throw err;
          }
        }
      } catch (refreshError) {
        clearAuthTokens();
        window.dispatchEvent(new CustomEvent('auth-expired'));
        const err = new Error('Session expired, please login again');
        (err as any).status = 401;
        throw err;
      }
    }

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err = new Error(`HTTP ${res.status} ${res.statusText} ${text}`);
      (err as any).status = res.status;

      if (res.status === 401) {
        window.dispatchEvent(new CustomEvent("auth-expired"));
      }

      throw err;
    }

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return res.json();
    }
    return res.text();
  } catch (error: any) {
    if (error.status === 401) {
      window.dispatchEvent(new CustomEvent("auth-expired"));
    }
    throw error;
  }
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
  setRefreshToken,
  getRefreshToken,
  clearAuthTokens,
};

import { setAuthToken, setRefreshToken, clearAuthTokens, AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}

export async function signupApi(data: { username: string; email: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Registration failed");
    }

    return res.json();
  } catch (err: any) {
    throw new Error(err.message || "Failed to connect to server!");
  }
}

export async function loginApi(data: { email: string; password: string }): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Login failed");
  }

  const result = await res.json();

  // Save tokens
  setAuthToken(result.access_token);
  setRefreshToken(result.refresh_token);

  return result;
}

export async function refreshTokenApi(refreshToken: string) {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại");
  }

  return res.json();
}

export async function logoutApi(accessToken: string) {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
    });
  } catch (e) {
    // Ignore logout errors
  } finally {
    clearAuthTokens();
  }
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem('user');
  } else {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
}

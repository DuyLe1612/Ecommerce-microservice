"use client";
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { loginApi, logoutApi, refreshTokenApi } from "@/services/auth";

export interface User {
  id?: string;
  username?: string;
  email: string;
  role: string;
  token: string;
  refreshToken?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  login: (email: string, password: string) => Promise<void | User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) setUser(JSON.parse(saved));
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const scheduleRefresh = useCallback(
    (currentUser: User) => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      if (!currentUser.refreshToken) return;

      const REFRESH_INTERVAL = 14 * 60 * 1000;

      refreshTimerRef.current = setTimeout(async () => {
        try {
          const res = await refreshTokenApi(currentUser.refreshToken!);
          const updated: User = {
            ...currentUser,
            token: res.access_token,
            refreshToken: res.refresh_token,
          };
          setUser(updated);
          localStorage.setItem("user", JSON.stringify(updated));
          localStorage.setItem("token", res.access_token);
          scheduleRefresh(updated);
        } catch {
          await doLogout(currentUser);
        }
      }, REFRESH_INTERVAL);
    },
    [],
  );

  useEffect(() => {
    if (user) {
      scheduleRefresh(user);
    } else {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    }
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [user, scheduleRefresh]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    };

    if (typeof window !== "undefined") {
      window.addEventListener("auth-expired", handleAuthExpired);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("auth-expired", handleAuthExpired);
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await loginApi({ email, password });

    if (res.access_token && res.user) {
      const userInfo: User = {
        id: res.user.id,
        username: res.user.username,
        email: res.user.email,
        role: res.user.role,
        token: res.access_token,
        refreshToken: res.refresh_token,
      };
      setUser(userInfo);
      localStorage.setItem("user", JSON.stringify(userInfo));
      localStorage.setItem("token", res.access_token);
      return userInfo;
    }
  };

  const doLogout = async (currentUser: User) => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    if (currentUser.token) {
      try {
        await logoutApi(currentUser.token);
      } catch (err) {
        // Ignore errors to prevent infinite loops if token is already expired
      }
    }
  };

  const logout = async () => {
    if (user) await doLogout(user);
  };

  const hasRole = (role: string) =>
    user?.role?.toLowerCase() === role.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role?.toLowerCase() === "admin",
        hasRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used within AuthProvider");
  return ctx;
};

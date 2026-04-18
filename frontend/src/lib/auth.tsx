"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const tokenRef = useRef<string | null>(null);

  // Keep tokenRef in sync so authFetch always sees the latest token
  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  // Restore session from refresh token on mount
  useEffect(() => {
    const restore = async () => {
      const rt = localStorage.getItem("mebble_rt");
      if (!rt) { setLoading(false); return; }
      try {
        const res  = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Authorization: `Bearer ${rt}` },
        });
        const json = await res.json();
        if (json.success) {
          setAccessToken(json.access_token);
          setUser(json.user);
        } else {
          localStorage.removeItem("mebble_rt");
        }
      } catch {
        // network failure — stay logged out
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    const res  = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Login failed.");
    localStorage.setItem("mebble_rt", json.refresh_token);
    setAccessToken(json.access_token);
    setUser(json.user);
  };

  const register = async (email: string, password: string) => {
    const res  = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || "Registration failed.");
    localStorage.setItem("mebble_rt", json.refresh_token);
    setAccessToken(json.access_token);
    setUser(json.user);
  };

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("mebble_rt");
  }, []);

  // authFetch: attaches the current access token and auto-refreshes on 401
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers = new Headers(options.headers as HeadersInit | undefined);
    if (tokenRef.current) headers.set("Authorization", `Bearer ${tokenRef.current}`);

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      const rt = localStorage.getItem("mebble_rt");
      if (rt) {
        const rr   = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { Authorization: `Bearer ${rt}` },
        });
        const rj   = await rr.json();
        if (rj.success) {
          setAccessToken(rj.access_token);
          tokenRef.current = rj.access_token;
          headers.set("Authorization", `Bearer ${rj.access_token}`);
          res = await fetch(url, { ...options, headers });
        } else {
          logout();
        }
      }
    }
    return res;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

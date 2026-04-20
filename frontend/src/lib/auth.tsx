"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { supabase } from "./supabase";

export interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  accessToken: string | null;
  loading: boolean;
  needsPasswordReset: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  logout: () => void;
  deleteAccount: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType>(null!);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]                         = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken]           = useState<string | null>(null);
  const [loading, setLoading]                   = useState(true);
  const [needsPasswordReset, setNeedsPasswordReset] = useState(false);
  const tokenRef = useRef<string | null>(null);

  useEffect(() => { tokenRef.current = accessToken; }, [accessToken]);

  // Subscribe to Supabase auth state changes (handles restore + login/logout)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email! });
        setAccessToken(session.access_token);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser({ id: session.user.id, email: session.user.email! });
        setAccessToken(session.access_token);
        if (event === "PASSWORD_RECOVERY") setNeedsPasswordReset(true);
      } else {
        setUser(null);
        setAccessToken(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const register = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw new Error(error.message);
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/builder`,
    });
    if (error) throw new Error(error.message);
  };

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);
    setNeedsPasswordReset(false);
  }, []);

  const deleteAccount = useCallback(async () => {
    const { error } = await supabase.rpc("delete_user");
    if (error) throw new Error(error.message);
    await supabase.auth.signOut();
  }, []);

  // authFetch: attaches the current Supabase access token, refreshes on 401
  const authFetch = useCallback(async (url: string, options: RequestInit = {}): Promise<Response> => {
    const getToken = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token ?? null;
    };

    const headers = new Headers(options.headers as HeadersInit | undefined);
    const token   = tokenRef.current ?? await getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    let res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      const { data: { session } } = await supabase.auth.refreshSession();
      if (session) {
        setAccessToken(session.access_token);
        tokenRef.current = session.access_token;
        headers.set("Authorization", `Bearer ${session.access_token}`);
        res = await fetch(url, { ...options, headers });
      } else {
        logout();
      }
    }

    return res;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, needsPasswordReset, login, register, resetPassword, updatePassword, logout, deleteAccount, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

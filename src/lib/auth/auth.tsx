"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

// Unified auth: real Supabase Auth when configured, otherwise a localStorage
// mock so the app still runs without a backend. Both expose the same API.

export interface AppUser {
  id: string;
  email: string;
}

type AuthResult = { ok: true } | { ok: false; error: "invalid" };

interface AuthContextValue {
  user: AppUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const MOCK_KEY = "studyflow.user";
const MIN_PASSWORD = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthContext = createContext<AuthContextValue | null>(null);

function mockValid(email: string, password: string): boolean {
  return EMAIL_RE.test(email.trim()) && password.length >= MIN_PASSWORD;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isSupabaseConfigured) {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        setUser(
          data.user ? { id: data.user.id, email: data.user.email ?? "" } : null,
        );
        setReady(true);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(
          session?.user
            ? { id: session.user.id, email: session.user.email ?? "" }
            : null,
        );
      });
      return () => sub.subscription.unsubscribe();
    }

    // Mock mode
    try {
      const raw = window.localStorage.getItem(MOCK_KEY);
      if (raw) setUser(JSON.parse(raw) as AppUser);
    } catch {
      // ignore
    }
    setReady(true);
  }, []);

  const mockPersist = useCallback((email: string) => {
    const value: AppUser = { id: email.trim().toLowerCase(), email: email.trim().toLowerCase() };
    setUser(value);
    try {
      window.localStorage.setItem(MOCK_KEY, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return error ? { ok: false, error: "invalid" } : { ok: true };
      }
      if (!mockValid(email, password)) return { ok: false, error: "invalid" };
      mockPersist(email);
      return { ok: true };
    },
    [mockPersist],
  );

  const register = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (isSupabaseConfigured) {
        const supabase = createClient();
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) return { ok: false, error: "invalid" };
        // When email confirmation is off, sign the user in right away.
        if (!data.session) {
          await supabase.auth.signInWithPassword({ email: email.trim(), password });
        }
        return { ok: true };
      }
      if (!mockValid(email, password)) return { ok: false, error: "invalid" };
      mockPersist(email);
      return { ok: true };
    },
    [mockPersist],
  );

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await createClient().auth.signOut();
    } else {
      try {
        window.localStorage.removeItem(MOCK_KEY);
      } catch {
        // ignore
      }
    }
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, register, logout }),
    [user, ready, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

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

// Mock authentication for Day 3-5 so protected pages and per-user data
// isolation can be demonstrated. Day 6-8: replace with Supabase Auth.
// The user id is derived from the email so a user's tasks persist across
// logins on the same browser. This is NOT real security — no passwords are
// stored or verified against a server.

export interface MockUser {
  id: string;
  email: string;
}

type AuthResult = { ok: true } | { ok: false; error: "invalid" };

interface AuthContextValue {
  user: MockUser | null;
  ready: boolean; // true once localStorage has been read
  login: (email: string, password: string) => AuthResult;
  register: (email: string, password: string) => AuthResult;
  logout: () => void;
}

const STORAGE_KEY = "studyflow.user";
const MIN_PASSWORD = 6;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AuthContext = createContext<AuthContextValue | null>(null);

function isValid(email: string, password: string): boolean {
  return EMAIL_RE.test(email.trim()) && password.length >= MIN_PASSWORD;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw) as MockUser);
    } catch {
      // ignore unreadable storage
    }
    setReady(true);
  }, []);

  const persist = useCallback((next: MockUser) => {
    const email = next.email.trim().toLowerCase();
    const value: MockUser = { id: email, email };
    setUser(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore
    }
  }, []);

  const login = useCallback(
    (email: string, password: string): AuthResult => {
      if (!isValid(email, password)) return { ok: false, error: "invalid" };
      persist({ id: email, email });
      return { ok: true };
    },
    [persist],
  );

  const register = useCallback(
    (email: string, password: string): AuthResult => {
      if (!isValid(email, password)) return { ok: false, error: "invalid" };
      persist({ id: email, email });
      return { ok: true };
    },
    [persist],
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
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

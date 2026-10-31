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
import { isValidCredentials } from "./validation";

// Client auth provider. Talks to the server session routes; the real session
// lives in an HTTP-only cookie the browser can't read, so here we only mirror
// the signed-in user (role + class membership) for the UI.

export type Role = "student" | "teacher";

export interface AppUser {
  id: string;
  email: string | null;
  role: Role;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "locked" };

interface AuthContextValue {
  user: AppUser | null;
  inClass: boolean;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (email: string, password: string) => Promise<AuthResult>;
  teacherLogin: (pin: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MeResponse {
  user: AppUser | null;
  inClass: boolean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [inClass, setInClass] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null, inClass: false }))
      .then((data: MeResponse) => {
        if (!active) return;
        setUser(data.user ?? null);
        setInClass(!!data.inClass);
        setReady(true);
      })
      .catch(() => {
        if (!active) return;
        setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const applyAuth = useCallback((data: MeResponse) => {
    setUser(data.user ?? null);
    setInClass(!!data.inClass);
  }, []);

  const studentAuth = useCallback(
    async (path: string, email: string, password: string): Promise<AuthResult> => {
      if (!isValidCredentials(email, password)) {
        return { ok: false, error: "invalid" };
      }
      const res = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      if (!res.ok) return { ok: false, error: "invalid" };
      applyAuth((await res.json()) as MeResponse);
      return { ok: true };
    },
    [applyAuth],
  );

  const login = useCallback(
    (email: string, password: string) =>
      studentAuth("/api/auth/login", email, password),
    [studentAuth],
  );

  const register = useCallback(
    (email: string, password: string) =>
      studentAuth("/api/auth/register", email, password),
    [studentAuth],
  );

  const teacherLogin = useCallback(
    async (pin: string): Promise<AuthResult> => {
      const res = await fetch("/api/teacher/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });
      if (res.status === 429) return { ok: false, error: "locked" };
      if (!res.ok) return { ok: false, error: "invalid" };
      setUser({ id: "teacher", email: null, role: "teacher" });
      setInClass(true);
      return { ok: true };
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      setInClass(false);
    }
  }, []);

  const value = useMemo(
    () => ({ user, inClass, ready, login, register, teacherLogin, logout }),
    [user, inClass, ready, login, register, teacherLogin, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

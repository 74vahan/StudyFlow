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
import { isValidLogin, isValidRegistration } from "./validation";

// Client auth provider. Talks to the server session routes; the real session
// lives in an HTTP-only cookie the browser can't read, so here we only mirror
// the signed-in user (role + class membership) for the UI.

export type Role = "student" | "teacher";

export interface AppUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  role: Role;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  firstName: string;
  lastName: string;
  password: string;
}

export type AuthResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "locked" | "server" };

interface AuthContextValue {
  user: AppUser | null;
  inClass: boolean;
  ready: boolean;
  login: (input: LoginInput) => Promise<AuthResult>;
  register: (input: RegisterInput) => Promise<AuthResult>;
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

  const postAuth = useCallback(
    async (path: string, payload: Record<string, string>): Promise<AuthResult> => {
      let res: Response;
      try {
        res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch {
        // Network error — server unreachable, not a credentials problem.
        return { ok: false, error: "server" };
      }
      if (res.ok) {
        applyAuth((await res.json()) as MeResponse);
        return { ok: true };
      }
      // 5xx means the server/DB failed; 4xx means bad credentials.
      return { ok: false, error: res.status >= 500 ? "server" : "invalid" };
    },
    [applyAuth],
  );

  const login = useCallback(
    (input: LoginInput) => {
      if (!isValidLogin(input.firstName, input.lastName, input.password)) {
        return Promise.resolve<AuthResult>({ ok: false, error: "invalid" });
      }
      return postAuth("/api/auth/login", {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        password: input.password,
      });
    },
    [postAuth],
  );

  const register = useCallback(
    (input: RegisterInput) => {
      if (
        !isValidRegistration(
          input.firstName,
          input.lastName,
          input.phone,
          input.password,
          input.confirmPassword,
        )
      ) {
        return Promise.resolve<AuthResult>({ ok: false, error: "invalid" });
      }
      return postAuth("/api/auth/register", {
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        phone: input.phone.trim(),
        password: input.password,
        confirmPassword: input.confirmPassword,
      });
    },
    [postAuth],
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
      setUser({ id: "teacher", firstName: null, lastName: null, role: "teacher" });
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

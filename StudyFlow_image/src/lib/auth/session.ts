import { SignJWT, jwtVerify } from "jose";

// Session token helpers (JWT, HS256). Pure jose — no next/headers, no DB — so
// this module is safe to import from both Node route handlers and the Edge
// proxy. Cookie reading/writing lives in current-user.ts (Node only).

export const SESSION_COOKIE = "studyflow_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days (seconds)

export type Role = "student" | "teacher";

// The teacher is not a DB user — it logs in with a PIN and gets this fixed id.
export const TEACHER_ID = "teacher";

export interface SessionUser {
  userId: string;
  email: string | null; // null for the teacher (no account)
  role: Role;
}

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a long random string in .env.local.",
    );
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(user: SessionUser): Promise<string> {
  return new SignJWT({ email: user.email ?? "", role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    // getSecret() is inside the try on purpose: a misconfigured secret should
    // read as "not authenticated" in the proxy, not crash the request.
    const { payload } = await jwtVerify(token, getSecret());
    if (!payload.sub) return null;
    const role: Role = payload.role === "teacher" ? "teacher" : "student";
    const email = typeof payload.email === "string" && payload.email ? payload.email : null;
    return { userId: payload.sub, email, role };
  } catch {
    return null; // invalid / expired / tampered
  }
}

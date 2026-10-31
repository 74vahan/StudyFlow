import { NextResponse, type NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { setSessionCookie } from "@/lib/auth/current-user";
import { TEACHER_ID } from "@/lib/auth/session";
import { lockedFor, recordFailure, recordSuccess } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const PIN_RE = /^\d{6}$/;

function clientKey(request: NextRequest): string {
  const fwd = request.headers.get("x-forwarded-for");
  const ip = fwd ? fwd.split(",")[0].trim() : "local";
  return `teacher:${ip}`;
}

export async function POST(request: NextRequest) {
  const key = clientKey(request);

  const lock = lockedFor(key);
  if (lock > 0) {
    return NextResponse.json(
      { error: "locked", retryAfterMs: lock },
      { status: 429 },
    );
  }

  let body: { pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const pin = typeof body.pin === "string" ? body.pin : "";
  if (!PIN_RE.test(pin)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  // The bcrypt hash is stored base64-encoded so its '$' characters don't get
  // mangled by .env variable expansion.
  const b64 = process.env.TEACHER_PIN_HASH_B64;
  if (!b64) {
    console.error("TEACHER_PIN_HASH_B64 is not set");
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  const hash = Buffer.from(b64, "base64").toString("utf8");

  const ok = await bcrypt.compare(pin, hash);
  if (!ok) {
    recordFailure(key);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  recordSuccess(key);
  await setSessionCookie({ userId: TEACHER_ID, email: null, role: "teacher" });
  return NextResponse.json({ ok: true, role: "teacher" });
}

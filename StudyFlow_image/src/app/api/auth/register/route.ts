import { NextResponse } from "next/server";
import { createUser, EmailTakenError } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/current-user";
import { isValidCredentials } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!isValidCredentials(email, password)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const user = await createUser(email, password);
    await setSessionCookie({ userId: user.id, email: user.email, role: "student" });
    // New students are not in the class yet — they land on /pending until the
    // teacher adds them.
    return NextResponse.json({
      user: { id: user.id, email: user.email, role: "student" },
      inClass: false,
    });
  } catch (err) {
    if (err instanceof EmailTakenError) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }
    console.error("register failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

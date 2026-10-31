import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/current-user";
import { isMember } from "@/lib/class/members";

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

  if (!email || !password) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const user = await verifyCredentials(email, password);
    if (!user) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }
    await setSessionCookie({ userId: user.id, email: user.email, role: "student" });
    const inClass = await isMember(user.id);
    return NextResponse.json({
      user: { id: user.id, email: user.email, role: "student" },
      inClass,
    });
  } catch (err) {
    console.error("login failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { verifyCredentials } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/current-user";
import { isMember } from "@/lib/class/members";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: { firstName?: unknown; lastName?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName : "";
  const lastName = typeof body.lastName === "string" ? body.lastName : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!firstName.trim() || !lastName.trim() || !password) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const user = await verifyCredentials(firstName, lastName, password);
    if (!user) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }
    await setSessionCookie({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: "student",
    });
    const inClass = await isMember(user.id);
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "student",
      },
      inClass,
    });
  } catch (err) {
    console.error("login failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import { isMember } from "@/lib/class/members";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ user: null, inClass: false });
  }

  if (session.role === "teacher") {
    return NextResponse.json({
      user: { id: session.userId, email: null, role: "teacher" },
      inClass: true,
    });
  }

  const inClass = await isMember(session.userId);
  return NextResponse.json({
    user: { id: session.userId, email: session.email, role: "student" },
    inClass,
  });
}

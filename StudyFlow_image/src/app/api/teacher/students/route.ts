import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import { listStudents } from "@/lib/class/members";

export const runtime = "nodejs";

export async function GET() {
  const session = await getSessionUser();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const students = await listStudents();
  return NextResponse.json({ students });
}

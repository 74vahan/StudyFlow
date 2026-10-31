import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import { addMember, removeMember } from "@/lib/class/members";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function requireTeacher() {
  const session = await getSessionUser();
  return session && session.role === "teacher" ? session : null;
}

// Add the student to the class.
export async function POST(_request: Request, { params }: Params) {
  if (!(await requireTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await addMember(id);
  return NextResponse.json({ ok: true });
}

// Remove the student from the class (cascades to their tasks).
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await removeMember(id);
  return NextResponse.json({ ok: true });
}

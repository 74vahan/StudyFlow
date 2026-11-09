import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import { deleteUser } from "@/lib/auth/users";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

async function requireTeacher() {
  const session = await getSessionUser();
  return session && session.role === "teacher" ? session : null;
}

// Permanently delete a student's account (user row + cascaded class membership
// and tasks). Distinct from DELETE /api/teacher/students/[id], which only
// removes them from the class but keeps the account.
export async function DELETE(_request: Request, { params }: Params) {
  if (!(await requireTeacher())) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteUser(id);
  return NextResponse.json({ ok: true });
}

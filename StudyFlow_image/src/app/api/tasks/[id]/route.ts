import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import {
  getTaskById,
  getTaskForStudent,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from "@/lib/tasks/mysql-store";
import { parseTaskInput } from "@/lib/tasks/validate";
import { STATUSES, type Status } from "@/lib/tasks/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const task =
    session.role === "teacher"
      ? await getTaskById(id)
      : await getTaskForStudent(session.userId, id);
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { id } = await params;

  // Teacher: full edit. Student: status only, on their own task.
  if (session.role === "teacher") {
    const input = parseTaskInput(body);
    if (!input) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const task = await updateTask(id, input);
    if (!task) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    return NextResponse.json({ task });
  }

  const status =
    body && typeof body === "object"
      ? ((body as Record<string, unknown>).status as Status)
      : undefined;
  if (!status || !STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const task = await updateTaskStatus(session.userId, id, status);
  if (!task) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}

// Only the teacher deletes tasks.
export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSessionUser();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { id } = await params;
  await deleteTask(id);
  return NextResponse.json({ ok: true });
}

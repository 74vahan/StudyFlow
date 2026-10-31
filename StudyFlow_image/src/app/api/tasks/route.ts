import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/auth/current-user";
import {
  listAllTasks,
  listTasksForStudent,
  createTask,
  AssigneeNotMemberError,
} from "@/lib/tasks/mysql-store";
import { parseTaskInput } from "@/lib/tasks/validate";
import type { Priority, Status } from "@/lib/tasks/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sp = request.nextUrl.searchParams;
  const filters = {
    search: sp.get("search") ?? undefined,
    status: (sp.get("status") as Status | "all" | null) ?? undefined,
    priority: (sp.get("priority") as Priority | "all" | null) ?? undefined,
  };

  if (session.role === "teacher") {
    const assignee = sp.get("assignee") ?? undefined;
    const tasks = await listAllTasks(filters, assignee);
    return NextResponse.json({ tasks });
  }

  const tasks = await listTasksForStudent(session.userId, filters);
  return NextResponse.json({ tasks });
}

// Only the teacher creates/assigns tasks.
export async function POST(request: Request) {
  const session = await getSessionUser();
  if (!session || session.role !== "teacher") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const input = parseTaskInput(body);
  const assigneeId =
    body && typeof body === "object" && typeof (body as Record<string, unknown>).assigneeId === "string"
      ? ((body as Record<string, unknown>).assigneeId as string)
      : "";
  if (!input || !assigneeId) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const task = await createTask(assigneeId, input);
    return NextResponse.json({ task }, { status: 201 });
  } catch (err) {
    if (err instanceof AssigneeNotMemberError) {
      return NextResponse.json({ error: "assignee_not_member" }, { status: 400 });
    }
    throw err;
  }
}

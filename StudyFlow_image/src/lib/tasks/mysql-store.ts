import "server-only";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { getPool } from "@/lib/db/mysql";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  type Status,
  type Task,
  type TaskInput,
} from "./types";
import type { TaskFilters, TaskStats } from "./contracts";

// Server-side task store (MySQL). Tasks are assigned by the teacher to a student
// (assignee_id). Student-facing calls are always scoped to assignee_id = the
// signed-in student's id (data isolation, AC-04) — that id comes from the
// session, never from the client.

interface TaskRow extends RowDataPacket {
  id: string;
  assignee_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // 'YYYY-MM-DD' (dateStrings for DATE)
  priority: Task["priority"];
  status: Task["status"];
  created_at: Date;
  updated_at: Date;
}

export class AssigneeNotMemberError extends Error {
  constructor() {
    super("assignee_not_member");
    this.name = "AssigneeNotMemberError";
  }
}

function mapRow(row: TaskRow): Task {
  return {
    id: row.id,
    assigneeId: row.assignee_id,
    title: row.title,
    description: row.description ?? null,
    dueDate: row.due_date ?? null,
    priority: row.priority,
    status: row.status,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function filterClauses(filters: TaskFilters): { sql: string; params: string[] } {
  const where: string[] = [];
  const params: string[] = [];
  const search = filters.search?.trim();
  if (search) {
    where.push("title LIKE ?");
    params.push(`%${search}%`);
  }
  if (filters.status && filters.status !== "all") {
    where.push("status = ?");
    params.push(filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    where.push("priority = ?");
    params.push(filters.priority);
  }
  return { sql: where.join(" AND "), params };
}

// --- Teacher views (all students) ------------------------------------------

export async function listAllTasks(
  filters: TaskFilters = {},
  assigneeId?: string,
): Promise<Task[]> {
  const { sql, params } = filterClauses(filters);
  const clauses = [sql].filter(Boolean);
  if (assigneeId) {
    clauses.push("assignee_id = ?");
    params.push(assigneeId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const [rows] = await getPool().execute<TaskRow[]>(
    `SELECT * FROM tasks ${where} ORDER BY created_at DESC`,
    params,
  );
  return rows.map(mapRow);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const [rows] = await getPool().execute<TaskRow[]>(
    "SELECT * FROM tasks WHERE id = ? LIMIT 1",
    [id],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function createTask(
  assigneeId: string,
  input: TaskInput,
): Promise<Task> {
  const id = crypto.randomUUID();
  const description = input.description?.trim() ? input.description.trim() : null;
  try {
    await getPool().execute(
      `INSERT INTO tasks (id, assignee_id, title, description, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        assigneeId,
        input.title.trim(),
        description,
        input.dueDate || null,
        input.priority ?? DEFAULT_PRIORITY,
        input.status ?? DEFAULT_STATUS,
      ],
    );
  } catch (err) {
    // FK violation = assignee is not a class member.
    if (err && typeof err === "object" && "code" in err && err.code === "ER_NO_REFERENCED_ROW_2") {
      throw new AssigneeNotMemberError();
    }
    throw err;
  }
  const created = await getTaskById(id);
  if (!created) throw new Error("Task vanished right after insert");
  return created;
}

export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<Task | null> {
  const description = input.description?.trim() ? input.description.trim() : null;
  const [result] = await getPool().execute<ResultSetHeader>(
    `UPDATE tasks
       SET title = ?, description = ?, due_date = ?, priority = ?, status = ?
     WHERE id = ?`,
    [
      input.title.trim(),
      description,
      input.dueDate || null,
      input.priority,
      input.status,
      id,
    ],
  );
  if (result.affectedRows === 0) return null;
  return getTaskById(id);
}

export async function deleteTask(id: string): Promise<void> {
  await getPool().execute("DELETE FROM tasks WHERE id = ?", [id]);
}

// --- Student views (own tasks only) ----------------------------------------

export async function listTasksForStudent(
  studentId: string,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const { sql, params } = filterClauses(filters);
  const clauses = ["assignee_id = ?", sql].filter(Boolean);
  const [rows] = await getPool().execute<TaskRow[]>(
    `SELECT * FROM tasks WHERE ${clauses.join(" AND ")} ORDER BY created_at DESC`,
    [studentId, ...params],
  );
  return rows.map(mapRow);
}

export async function getTaskForStudent(
  studentId: string,
  id: string,
): Promise<Task | null> {
  const [rows] = await getPool().execute<TaskRow[]>(
    "SELECT * FROM tasks WHERE id = ? AND assignee_id = ? LIMIT 1",
    [id, studentId],
  );
  return rows[0] ? mapRow(rows[0]) : null;
}

// A student may change only the status of their own task.
export async function updateTaskStatus(
  studentId: string,
  id: string,
  status: Status,
): Promise<Task | null> {
  const [result] = await getPool().execute<ResultSetHeader>(
    "UPDATE tasks SET status = ? WHERE id = ? AND assignee_id = ?",
    [status, id, studentId],
  );
  if (result.affectedRows === 0) return null;
  return getTaskForStudent(studentId, id);
}

// --- Stats ------------------------------------------------------------------

async function statsWhere(where: string, params: string[]): Promise<TaskStats> {
  const [rows] = await getPool().execute<RowDataPacket[]>(
    `SELECT
       COUNT(*)                    AS total,
       SUM(status = 'done')        AS done,
       SUM(status = 'in_progress') AS inProgress
     FROM tasks ${where}`,
    params,
  );
  const row = rows[0] ?? {};
  return {
    total: Number(row.total ?? 0),
    done: Number(row.done ?? 0),
    inProgress: Number(row.inProgress ?? 0),
  };
}

export function statsForStudent(studentId: string): Promise<TaskStats> {
  return statsWhere("WHERE assignee_id = ?", [studentId]);
}

export function statsAll(): Promise<TaskStats> {
  return statsWhere("", []);
}

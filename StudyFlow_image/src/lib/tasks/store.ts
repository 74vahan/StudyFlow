"use client";

// Client-side task data layer. Calls the server API routes (/api/tasks); the
// server scopes results by role (teacher → all, student → own) from the session
// cookie. No user/assignee id is trusted from the browser for students.

import type { Status, Task, TaskInput } from "./types";
import type { TaskFilters, TaskStats } from "./contracts";

export type { TaskFilters, TaskStats } from "./contracts";

async function readJson<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

function buildQuery(filters: TaskFilters, assigneeId?: string): string {
  const qs = new URLSearchParams();
  if (filters.search?.trim()) qs.set("search", filters.search.trim());
  if (filters.status && filters.status !== "all") qs.set("status", filters.status);
  if (filters.priority && filters.priority !== "all") qs.set("priority", filters.priority);
  if (assigneeId) qs.set("assignee", assigneeId);
  const s = qs.toString();
  return s ? `?${s}` : "";
}

// Teacher may pass assigneeId to filter by student; students ignore it (server
// forces their own id).
export async function listTasks(
  filters: TaskFilters = {},
  assigneeId?: string,
): Promise<Task[]> {
  const res = await fetch(`/api/tasks${buildQuery(filters, assigneeId)}`, {
    cache: "no-store",
  });
  const data = await readJson<{ tasks: Task[] }>(res);
  return data.tasks;
}

export async function getTask(id: string): Promise<Task | null> {
  const res = await fetch(`/api/tasks/${id}`, { cache: "no-store" });
  if (res.status === 404) return null;
  const data = await readJson<{ task: Task }>(res);
  return data.task;
}

// Teacher only.
export async function createTask(
  assigneeId: string,
  input: TaskInput,
): Promise<Task> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...input, assigneeId }),
  });
  const data = await readJson<{ task: Task }>(res);
  return data.task;
}

// Teacher only — full edit.
export async function updateTask(
  id: string,
  input: TaskInput,
): Promise<Task | null> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (res.status === 404) return null;
  const data = await readJson<{ task: Task }>(res);
  return data.task;
}

// Student — change only the status of their own task.
export async function updateStatus(
  id: string,
  status: Status,
): Promise<Task | null> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (res.status === 404) return null;
  const data = await readJson<{ task: Task }>(res);
  return data.task;
}

// Teacher only.
export async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
}

export async function taskStats(assigneeId?: string): Promise<TaskStats> {
  const tasks = await listTasks({}, assigneeId);
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  };
}

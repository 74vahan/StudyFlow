"use client";

import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  type Task,
  type TaskInput,
} from "./types";
import type { TaskFilters, TaskStats } from "./contracts";

// Local (localStorage) task store — the fallback used when Supabase is not
// configured, so the app runs without a backend during development.
// Scoped by userId to mirror the Supabase RLS rule.

const KEY = "studyflow.tasks";

function readAll(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

function writeAll(tasks: Task[]): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(tasks));
  } catch {
    // Storage unavailable (private mode / quota); best-effort.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function listTasks(userId: string, filters: TaskFilters = {}): Task[] {
  let tasks = readAll().filter((t) => t.userId === userId);

  const search = filters.search?.trim().toLowerCase();
  if (search) tasks = tasks.filter((t) => t.title.toLowerCase().includes(search));
  if (filters.status && filters.status !== "all") {
    tasks = tasks.filter((t) => t.status === filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    tasks = tasks.filter((t) => t.priority === filters.priority);
  }

  return tasks.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getTask(userId: string, id: string): Task | null {
  return readAll().find((t) => t.id === id && t.userId === userId) ?? null;
}

export function createTask(userId: string, input: TaskInput): Task {
  const now = new Date().toISOString();
  const task: Task = {
    id: newId(),
    userId,
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    dueDate: input.dueDate || null,
    priority: input.priority ?? DEFAULT_PRIORITY,
    status: input.status ?? DEFAULT_STATUS,
    createdAt: now,
    updatedAt: now,
  };
  writeAll([task, ...readAll()]);
  return task;
}

export function updateTask(
  userId: string,
  id: string,
  input: TaskInput,
): Task | null {
  const all = readAll();
  const index = all.findIndex((t) => t.id === id && t.userId === userId);
  if (index === -1) return null;

  all[index] = {
    ...all[index],
    title: input.title.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    dueDate: input.dueDate || null,
    priority: input.priority,
    status: input.status,
    updatedAt: new Date().toISOString(),
  };
  writeAll(all);
  return all[index];
}

export function deleteTask(userId: string, id: string): void {
  writeAll(readAll().filter((t) => !(t.id === id && t.userId === userId)));
}

export function taskStats(userId: string): TaskStats {
  const tasks = readAll().filter((t) => t.userId === userId);
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  };
}

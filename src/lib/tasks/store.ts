"use client";

// Facade over the task data layer. Uses Supabase when configured, otherwise the
// local (localStorage) store. All functions are async so pages/components work
// the same regardless of backend.

import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Task, TaskInput } from "./types";
import type { TaskFilters, TaskStats } from "./contracts";
import * as local from "./local-store";
import * as remote from "./supabase-store";

export type { TaskFilters, TaskStats } from "./contracts";

const backend = isSupabaseConfigured ? remote : local;

export function listTasks(
  userId: string,
  filters: TaskFilters = {},
): Promise<Task[]> {
  return Promise.resolve(backend.listTasks(userId, filters));
}

export function getTask(userId: string, id: string): Promise<Task | null> {
  return Promise.resolve(backend.getTask(userId, id));
}

export function createTask(userId: string, input: TaskInput): Promise<Task> {
  return Promise.resolve(backend.createTask(userId, input));
}

export function updateTask(
  userId: string,
  id: string,
  input: TaskInput,
): Promise<Task | null> {
  return Promise.resolve(backend.updateTask(userId, id, input));
}

export function deleteTask(userId: string, id: string): Promise<void> {
  return Promise.resolve(backend.deleteTask(userId, id));
}

export function taskStats(userId: string): Promise<TaskStats> {
  return Promise.resolve(backend.taskStats(userId));
}

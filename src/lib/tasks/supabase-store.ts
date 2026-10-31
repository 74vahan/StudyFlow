"use client";

import { createClient } from "@/lib/supabase/client";
import { DEFAULT_PRIORITY, DEFAULT_STATUS, type Task, type TaskInput } from "./types";
import type { TaskFilters, TaskStats } from "./contracts";

// Supabase task store (used when Supabase is configured). RLS enforces that a
// user only ever sees/changes their own rows, so queries don't need to filter
// by user_id on reads — but we still set it on insert.

// DB row shape (snake_case) → domain Task (camelCase).
interface Row {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: Task["priority"];
  status: Task["status"];
  created_at: string;
  updated_at: string;
}

function toTask(r: Row): Task {
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    dueDate: r.due_date,
    priority: r.priority,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listTasks(
  _userId: string,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const supabase = createClient();
  let query = supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  const search = filters.search?.trim();
  if (search) query = query.ilike("title", `%${search}%`);
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }
  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data as Row[]).map(toTask);
}

export async function getTask(
  _userId: string,
  id: string,
): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? toTask(data as Row) : null;
}

export async function createTask(
  userId: string,
  input: TaskInput,
): Promise<Task> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: userId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.dueDate || null,
      priority: input.priority ?? DEFAULT_PRIORITY,
      status: input.status ?? DEFAULT_STATUS,
    })
    .select("*")
    .single();
  if (error) throw error;
  return toTask(data as Row);
}

export async function updateTask(
  _userId: string,
  id: string,
  input: TaskInput,
): Promise<Task | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      due_date: input.dueDate || null,
      priority: input.priority,
      status: input.status,
    })
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error) throw error;
  return data ? toTask(data as Row) : null;
}

export async function deleteTask(_userId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function taskStats(userId: string): Promise<TaskStats> {
  const tasks = await listTasks(userId);
  return {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  };
}

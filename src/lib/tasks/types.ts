// Domain types for tasks. These match the planned Supabase `tasks` table so the
// mock store (Day 3-5) can be swapped for Supabase (Day 6-8) without UI changes.

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string | null; // ISO date (yyyy-mm-dd) or null
  priority: Priority;
  status: Status;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface TaskInput {
  title: string;
  description?: string | null;
  dueDate?: string | null;
  priority: Priority;
  status: Status;
}

export const PRIORITIES: Priority[] = ["low", "medium", "high"];
export const STATUSES: Status[] = ["todo", "in_progress", "done"];

export const DEFAULT_PRIORITY: Priority = "medium";
export const DEFAULT_STATUS: Status = "todo";

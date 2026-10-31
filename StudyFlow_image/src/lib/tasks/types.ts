// Domain types for tasks. These mirror the MySQL `tasks` table (see
// db/schema.sql); the API maps snake_case columns to these camelCase fields.

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  assigneeId: string; // the student this task is assigned to
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

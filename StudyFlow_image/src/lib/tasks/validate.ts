import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type TaskInput,
} from "./types";

// Validate/normalize an untrusted request body into a TaskInput. Returns null
// when the payload is not a usable task (used by the API routes to answer 400).

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function parseTaskInput(body: unknown): TaskInput | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.trim() : "";
  if (!title) return null;

  const priority: Priority = PRIORITIES.includes(b.priority as Priority)
    ? (b.priority as Priority)
    : DEFAULT_PRIORITY;
  const status: Status = STATUSES.includes(b.status as Status)
    ? (b.status as Status)
    : DEFAULT_STATUS;

  const description =
    typeof b.description === "string" && b.description.trim()
      ? b.description.trim()
      : null;

  const dueDate =
    typeof b.dueDate === "string" && DATE_RE.test(b.dueDate) ? b.dueDate : null;

  return { title, description, dueDate, priority, status };
}

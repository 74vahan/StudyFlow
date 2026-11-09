"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/i18n";
import {
  DEFAULT_PRIORITY,
  DEFAULT_STATUS,
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type Task,
  type TaskInput,
} from "@/lib/tasks/types";

interface TaskFormProps {
  initial?: Task | null;
  submitLabel: string;
  onSubmit: (input: TaskInput) => void;
  onCancel: () => void;
}

const field = "rf-field text-sm";
const label = "block text-sm font-semibold mb-1";

export function TaskForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [dueDate, setDueDate] = useState(initial?.dueDate ?? "");
  const [priority, setPriority] = useState<Priority>(
    initial?.priority ?? DEFAULT_PRIORITY,
  );
  const [status, setStatus] = useState<Status>(initial?.status ?? DEFAULT_STATUS);
  const [error, setError] = useState<string | null>(null);

  const priorityLabel: Record<Priority, string> = {
    low: t("task.priorityLow"),
    medium: t("task.priorityMedium"),
    high: t("task.priorityHigh"),
  };
  const statusLabel: Record<Status, string> = {
    todo: t("task.statusTodo"),
    in_progress: t("task.statusInProgress"),
    done: t("task.statusDone"),
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(t("task.titleRequired"));
      return;
    }
    setError(null);
    onSubmit({
      title,
      description: description || null,
      dueDate: dueDate || null,
      priority,
      status,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4" noValidate>
      <div>
        <label htmlFor="title" className={label}>
          {t("task.title")}
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={field}
          aria-invalid={Boolean(error)}
        />
        {error && <p className="mt-1 text-sm font-semibold text-coral">{error}</p>}
      </div>

      <div>
        <label htmlFor="description" className={label}>
          {t("task.description")}
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="dueDate" className={label}>
            {t("task.dueDate")}
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="priority" className={label}>
            {t("task.priority")}
          </label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className={field}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {priorityLabel[p]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="status" className={label}>
            {t("task.status")}
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as Status)}
            className={field}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn btn-primary">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          {t("common.cancel")}
        </button>
      </div>
    </form>
  );
}

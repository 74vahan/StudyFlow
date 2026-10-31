"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { createTask, deleteTask, listTasks } from "@/lib/tasks/store";
import {
  DEFAULT_PRIORITY,
  PRIORITIES,
  type Priority,
  type Task,
} from "@/lib/tasks/types";
import type { Student } from "@/lib/teacher/api";

const field =
  "w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

interface Props {
  members: Student[]; // students currently in the class
}

export function TeacherTasks({ members }: Props) {
  const { t } = useI18n();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStudent, setFilterStudent] = useState("");

  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<Priority>(DEFAULT_PRIORITY);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emailById = useMemo(() => {
    const m = new Map<string, string>();
    members.forEach((s) => m.set(s.id, s.email));
    return m;
  }, [members]);

  const refresh = useCallback(() => {
    setLoading(true);
    listTasks({}, filterStudent || undefined)
      .then((list) => setTasks(list))
      .finally(() => setLoading(false));
  }, [filterStudent]);

  useEffect(() => refresh(), [refresh]);

  const priorityLabel: Record<Priority, string> = {
    low: t("task.priorityLow"),
    medium: t("task.priorityMedium"),
    high: t("task.priorityHigh"),
  };

  async function handleAssign(e: React.FormEvent) {
    e.preventDefault();
    if (!assigneeId) {
      setError(t("teacher.selectStudent"));
      return;
    }
    if (!title.trim()) {
      setError(t("task.titleRequired"));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createTask(assigneeId, {
        title,
        description: description || null,
        dueDate: dueDate || null,
        priority,
        status: "todo",
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority(DEFAULT_PRIORITY);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("task.confirmDelete"))) return;
    await deleteTask(id);
    refresh();
  }

  return (
    <section className="space-y-5">
      <h2 className="text-lg font-semibold">{t("teacher.tasksTitle")}</h2>

      {members.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 py-6 text-center text-foreground/60">
          {t("teacher.noMembers")}
        </p>
      ) : (
        <form
          onSubmit={handleAssign}
          className="space-y-3 rounded-xl border border-foreground/10 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("teacher.assignTo")}
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className={field}
              >
                <option value="">{t("teacher.selectStudent")}</option>
                {members.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("task.title")}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={field}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              {t("task.description")}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className={field}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("task.dueDate")}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("task.priority")}
              </label>
              <select
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
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {saving ? t("common.saving") : t("teacher.assignTask")}
          </button>
        </form>
      )}

      <div className="flex items-center gap-3">
        <select
          value={filterStudent}
          onChange={(e) => setFilterStudent(e.target.value)}
          className={`${field} max-w-xs`}
          aria-label={t("teacher.allStudents")}
        >
          <option value="">{t("teacher.allStudents")}</option>
          {members.map((s) => (
            <option key={s.id} value={s.id}>
              {s.email}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-foreground/60">{t("task.loading")}</p>
      ) : tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 py-8 text-center text-foreground/60">
          {t("task.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-foreground/10 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{task.title}</p>
                <p className="text-xs text-foreground/50">
                  {t("task.assignedTo")}: {emailById.get(task.assigneeId) ?? task.assigneeId}
                  {" · "}
                  {task.dueDate ?? t("task.noDueDate")}
                </p>
              </div>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
              >
                {t("task.delete")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

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

const field = "rf-field text-sm";

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

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    members.forEach((s) => m.set(s.id, `${s.lastName} ${s.firstName}`.trim()));
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
      <h2 className="text-xl font-bold">{t("teacher.tasksTitle")}</h2>

      {members.length === 0 ? (
        <p className="rf-card-dashed py-6 text-center text-ink/60">
          {t("teacher.noMembers")}
        </p>
      ) : (
        <form
          onSubmit={handleAssign}
          className="rf-card space-y-3 p-4"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold">
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
                    {s.lastName} {s.firstName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">
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
            <label className="mb-1 block text-sm font-semibold">
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
              <label className="mb-1 block text-sm font-semibold">
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
              <label className="mb-1 block text-sm font-semibold">
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

          {error && <p className="text-sm font-semibold text-coral">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary"
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
              {s.lastName} {s.firstName}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-ink/60">{t("task.loading")}</p>
      ) : tasks.length === 0 ? (
        <p className="rf-card-dashed py-8 text-center text-ink/60">
          {t("task.empty")}
        </p>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rf-card rf-card-hover p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{task.title}</p>
                <p className="text-xs text-ink/50">
                  {t("task.assignedTo")}: {nameById.get(task.assigneeId) ?? task.assigneeId}
                  {" · "}
                  {task.dueDate ?? t("task.noDueDate")}
                </p>
              </div>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <button
                type="button"
                onClick={() => handleDelete(task.id)}
                className="btn btn-danger btn-sm"
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

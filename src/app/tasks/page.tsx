"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/mock-auth";
import { deleteTask, listTasks } from "@/lib/tasks/store";
import {
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
  type Task,
} from "@/lib/tasks/types";

const control =
  "rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

function TasksView() {
  const { t } = useI18n();
  const { user } = useAuth();
  const userId = user!.id;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setTasks(listTasks(userId, { search, status, priority }));
    setLoading(false);
  }, [userId, search, status, priority]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Distinguish "no tasks at all" from "no results for current filters".
  const hasAnyTasks = listTasks(userId).length > 0;
  const filtersActive =
    search.trim() !== "" || status !== "all" || priority !== "all";

  function handleDelete(id: string) {
    if (!window.confirm(t("task.confirmDelete"))) return;
    deleteTask(userId, id);
    refresh();
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">{t("nav.tasks")}</h1>
        <Link
          href="/tasks/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {t("task.new")}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          placeholder={t("task.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`${control} flex-1 min-w-[12rem]`}
          aria-label={t("task.search")}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "all")}
          className={control}
          aria-label={t("task.status")}
        >
          <option value="all">{t("task.allStatuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "all")}
          className={control}
          aria-label={t("task.priority")}
        >
          <option value="all">{t("task.allPriorities")}</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {priorityLabel[p]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="py-12 text-center text-foreground/60">
          {t("task.loading")}
        </p>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/15 py-12 text-center">
          <p className="text-foreground/60">
            {hasAnyTasks && filtersActive
              ? t("task.noResults")
              : t("task.empty")}
          </p>
          {!hasAnyTasks && (
            <Link
              href="/tasks/new"
              className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("task.addFirst")}
            </Link>
          )}
        </div>
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
                  {task.dueDate ?? t("task.noDueDate")}
                </p>
              </div>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
              <div className="flex items-center gap-2">
                <Link
                  href={`/tasks/${task.id}`}
                  className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm transition-colors hover:bg-foreground/5"
                >
                  {t("task.edit")}
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(task.id)}
                  className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                >
                  {t("task.delete")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function TasksPage() {
  return (
    <AppShell>
      <TasksView />
    </AppShell>
  );
}

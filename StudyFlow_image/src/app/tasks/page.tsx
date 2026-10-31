"use client";

import { useCallback, useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PriorityBadge } from "@/components/Badge";
import { useI18n } from "@/i18n/i18n";
import { listTasks, updateStatus } from "@/lib/tasks/store";
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

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");
  const [priority, setPriority] = useState<Priority | "all">("all");

  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasAnyTasks, setHasAnyTasks] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listTasks({ search, status, priority }), listTasks()]).then(
      ([filtered, all]) => {
        if (cancelled) return;
        setTasks(filtered);
        setHasAnyTasks(all.length > 0);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [search, status, priority]);

  useEffect(() => refresh(), [refresh]);

  const filtersActive =
    search.trim() !== "" || status !== "all" || priority !== "all";

  async function handleStatusChange(id: string, next: Status) {
    // Optimistic update, then persist.
    setTasks((prev) =>
      prev.map((task) => (task.id === id ? { ...task, status: next } : task)),
    );
    await updateStatus(id, next);
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
      <h1 className="text-2xl font-semibold">{t("task.yourTasks")}</h1>

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
        <p className="py-12 text-center text-foreground/60">{t("task.loading")}</p>
      ) : tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-foreground/15 py-12 text-center">
          <p className="text-foreground/60">
            {hasAnyTasks && filtersActive
              ? t("task.noResults")
              : t("task.noneAssigned")}
          </p>
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
              <PriorityBadge priority={task.priority} />
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task.id, e.target.value as Status)
                }
                className={control}
                aria-label={t("task.status")}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {statusLabel[s]}
                  </option>
                ))}
              </select>
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

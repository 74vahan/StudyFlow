"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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

const control = "rf-field text-sm";

// One route (= one tab) per status. The tab nav links to these pages so each
// status is its own page/URL, not a filter on one big list.
const TABS: { status: Status; href: string }[] = [
  { status: "todo", href: "/tasks" },
  { status: "in_progress", href: "/tasks/in-progress" },
  { status: "done", href: "/tasks/done" },
];

export function StudentTasksView({ status }: { status: Status }) {
  const { t } = useI18n();
  const pathname = usePathname();

  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    listTasks({ search, status, priority }).then((list) => {
      if (cancelled) return;
      setTasks(list);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [search, status, priority]);

  useEffect(() => refresh(), [refresh]);

  const statusLabel: Record<Status, string> = {
    todo: t("task.statusTodo"),
    in_progress: t("task.statusInProgress"),
    done: t("task.statusDone"),
  };
  const priorityLabel: Record<Priority, string> = {
    low: t("task.priorityLow"),
    medium: t("task.priorityMedium"),
    high: t("task.priorityHigh"),
  };

  const filtersActive = search.trim() !== "" || priority !== "all";

  async function handleStatusChange(id: string, next: Status) {
    // Changing status moves the task to another tab: drop it from this list
    // optimistically, then persist and refresh.
    if (next !== status) {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    }
    await updateStatus(id, next);
    refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="rf-enter text-3xl font-bold">{t("task.yourTasks")}</h1>

      {/* status tabs — each is its own page */}
      <nav className="flex flex-wrap gap-2">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rf-navlink text-sm ${active ? "rf-navlink-active" : ""}`}
            >
              {statusLabel[tab.status]}
            </Link>
          );
        })}
      </nav>

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
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "all")}
          className={`${control} w-auto`}
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
        <p className="py-12 text-center text-ink/60">{t("task.loading")}</p>
      ) : tasks.length === 0 ? (
        <div className="rf-card-dashed py-12 text-center">
          <p className="text-ink/60">
            {filtersActive ? t("task.noResults") : t("task.noneAssigned")}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rf-card rf-card-hover p-4"
            >
              <Link
                href={`/tasks/${task.id}`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-semibold hover:text-tangerine">
                  {task.title}
                </p>
                <p className="text-xs text-ink/50">
                  {task.dueDate ?? t("task.noDueDate")}
                </p>
              </Link>
              <PriorityBadge priority={task.priority} />
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task.id, e.target.value as Status)
                }
                className={`${control} w-auto`}
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

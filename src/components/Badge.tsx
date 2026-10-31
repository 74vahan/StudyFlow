"use client";

import { useI18n } from "@/i18n/i18n";
import type { Priority, Status } from "@/lib/tasks/types";

const STATUS_CLASSES: Record<Status, string> = {
  todo: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  in_progress:
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const PRIORITY_CLASSES: Record<Priority, string> = {
  low: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  medium: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
  high: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
};

const STATUS_KEY: Record<Status, string> = {
  todo: "task.statusTodo",
  in_progress: "task.statusInProgress",
  done: "task.statusDone",
};

const PRIORITY_KEY: Record<Priority, string> = {
  low: "task.priorityLow",
  medium: "task.priorityMedium",
  high: "task.priorityHigh",
};

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useI18n();
  return (
    <span className={`${base} ${STATUS_CLASSES[status]}`}>
      {t(STATUS_KEY[status])}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useI18n();
  return (
    <span className={`${base} ${PRIORITY_CLASSES[priority]}`}>
      {t(PRIORITY_KEY[priority])}
    </span>
  );
}

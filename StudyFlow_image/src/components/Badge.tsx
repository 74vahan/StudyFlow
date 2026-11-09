"use client";

import { useI18n } from "@/i18n/i18n";
import type { Priority, Status } from "@/lib/tasks/types";

// Atompunk badge colours (inline so the exact atomic hues are used, not Tailwind
// defaults). White text on saturated accents keeps contrast high.
const STATUS_STYLE: Record<Status, React.CSSProperties> = {
  todo: { backgroundColor: "var(--surface)", color: "var(--ink)" },
  in_progress: { backgroundColor: "var(--mustard)", color: "var(--ink)" },
  done: { backgroundColor: "var(--teal)", color: "#fff" },
};

const PRIORITY_STYLE: Record<Priority, React.CSSProperties> = {
  low: { backgroundColor: "var(--sky)", color: "#fff" },
  medium: { backgroundColor: "var(--mustard)", color: "var(--ink)" },
  high: { backgroundColor: "var(--coral)", color: "#fff" },
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

export function StatusBadge({ status }: { status: Status }) {
  const { t } = useI18n();
  return (
    <span className="rf-badge" style={STATUS_STYLE[status]}>
      {t(STATUS_KEY[status])}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { t } = useI18n();
  return (
    <span className="rf-badge" style={PRIORITY_STYLE[priority]}>
      {t(PRIORITY_KEY[priority])}
    </span>
  );
}

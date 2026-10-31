"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PriorityBadge } from "@/components/Badge";
import { useI18n } from "@/i18n/i18n";
import { getTask, updateStatus } from "@/lib/tasks/store";
import { STATUSES, type Status, type Task } from "@/lib/tasks/types";

const control =
  "rounded-md border border-foreground/15 bg-background px-3 py-2 text-sm outline-none focus:border-foreground/40";

function TaskDetailView() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTask(params.id).then((found) => {
      if (!active) return;
      setTask(found);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [params.id]);

  const statusLabel: Record<Status, string> = {
    todo: t("task.statusTodo"),
    in_progress: t("task.statusInProgress"),
    done: t("task.statusDone"),
  };

  async function handleStatusChange(next: Status) {
    if (!task) return;
    setTask({ ...task, status: next });
    await updateStatus(task.id, next);
  }

  if (loading) {
    return <p className="text-foreground/60">{t("task.loading")}</p>;
  }

  if (!task) {
    return (
      <div className="space-y-4">
        <p className="text-foreground/60">{t("task.notFound")}</p>
        <button
          type="button"
          onClick={() => router.push("/tasks")}
          className="rounded-md border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          {t("common.back")}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold">{task.title}</h1>
        <PriorityBadge priority={task.priority} />
      </div>

      {task.description && (
        <p className="whitespace-pre-wrap text-foreground/80">{task.description}</p>
      )}

      <p className="text-sm text-foreground/50">
        {t("task.dueDate")}: {task.dueDate ?? t("task.noDueDate")}
      </p>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium">
          {t("task.status")}
        </label>
        <select
          id="status"
          value={task.status}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
          className={`${control} max-w-xs`}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={() => router.push("/tasks")}
        className="rounded-md border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        {t("common.back")}
      </button>
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <AppShell>
      <TaskDetailView />
    </AppShell>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/mock-auth";
import { listTasks, taskStats, type TaskStats } from "@/lib/tasks/store";
import type { Task } from "@/lib/tasks/types";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-foreground/10 p-5">
      <p className="text-sm text-foreground/60">{label}</p>
      <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function DashboardView() {
  const { t } = useI18n();
  const { user } = useAuth();
  const userId = user!.id;

  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    done: 0,
    inProgress: 0,
  });
  const [recent, setRecent] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats(taskStats(userId));
    setRecent(listTasks(userId).slice(0, 5));
    setLoading(false);
  }, [userId]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("dashboard.total")} value={stats.total} />
        <StatCard label={t("dashboard.inProgress")} value={stats.inProgress} />
        <StatCard label={t("dashboard.done")} value={stats.done} />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("dashboard.recent")}</h2>
          <Link href="/tasks" className="text-sm underline">
            {t("dashboard.viewAll")}
          </Link>
        </div>

        {loading ? (
          <p className="text-foreground/60">{t("task.loading")}</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-foreground/15 py-10 text-center">
            <p className="text-foreground/60">{t("task.empty")}</p>
            <Link
              href="/tasks/new"
              className="mt-4 inline-block rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
            >
              {t("task.addFirst")}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-foreground/10 p-4"
              >
                <Link
                  href={`/tasks/${task.id}`}
                  className="min-w-0 flex-1 truncate font-medium hover:underline"
                >
                  {task.title}
                </Link>
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppShell>
      <DashboardView />
    </AppShell>
  );
}

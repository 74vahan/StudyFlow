"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PriorityBadge, StatusBadge } from "@/components/Badge";
import { useI18n } from "@/i18n/i18n";
import { listTasks, taskStats, type TaskStats } from "@/lib/tasks/store";
import type { Task } from "@/lib/tasks/types";

function StatCard({
  label,
  value,
  accent,
  delay,
}: {
  label: string;
  value: number;
  accent: string;
  delay: string;
}) {
  return (
    <div className={`rf-card rf-card-hover ${delay} p-5`}>
      <span
        className="mb-3 block h-2 w-10 rounded-full border-2 border-ink"
        style={{ backgroundColor: accent }}
      />
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="mt-1 text-4xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function DashboardView() {
  const { t } = useI18n();

  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    done: 0,
    inProgress: 0,
  });
  const [recent, setRecent] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([taskStats(), listTasks()]).then(
      ([s, all]) => {
        if (!active) return;
        setStats(s);
        setRecent(all.slice(0, 5));
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="rf-enter text-3xl font-bold">{t("dashboard.title")}</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dashboard.total")}
          value={stats.total}
          accent="var(--sky)"
          delay="rf-enter"
        />
        <StatCard
          label={t("dashboard.inProgress")}
          value={stats.inProgress}
          accent="var(--mustard)"
          delay="rf-enter-2"
        />
        <StatCard
          label={t("dashboard.done")}
          value={stats.done}
          accent="var(--teal)"
          delay="rf-enter-3"
        />
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{t("dashboard.recent")}</h2>
          <Link
            href="/tasks"
            className="text-sm font-semibold text-teal underline underline-offset-4"
          >
            {t("dashboard.viewAll")}
          </Link>
        </div>

        {loading ? (
          <p className="text-ink/60">{t("task.loading")}</p>
        ) : recent.length === 0 ? (
          <div className="rf-card-dashed py-10 text-center">
            <p className="text-ink/60">{t("task.noneAssigned")}</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((task) => (
              <li
                key={task.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rf-card rf-card-hover p-4"
              >
                <Link
                  href={`/tasks/${task.id}`}
                  className="min-w-0 flex-1 truncate font-semibold hover:text-tangerine"
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

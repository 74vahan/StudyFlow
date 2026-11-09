"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { TeacherShell } from "@/components/TeacherShell";
import { listStudents } from "@/lib/teacher/api";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number | string;
  accent: string;
}) {
  return (
    <div className="rf-card p-5">
      <span
        className="mb-3 block h-2 w-10 rounded-full border-2 border-ink"
        style={{ backgroundColor: accent }}
      />
      <p className="text-sm font-semibold text-ink/70">{label}</p>
      <p className="mt-1 text-4xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

function NavCard({
  href,
  title,
  desc,
  accent,
  delay,
}: {
  href: string;
  title: string;
  desc: string;
  accent: string;
  delay: string;
}) {
  return (
    <Link href={href} className={`rf-card rf-card-hover ${delay} block p-6`}>
      <span
        className="mb-3 inline-block rounded-md border-2 border-ink px-2 py-0.5 text-xs font-bold"
        style={{ backgroundColor: accent, color: "#fff" }}
      >
        →
      </span>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="mt-1 text-sm text-ink/70">{desc}</p>
    </Link>
  );
}

function OverviewView() {
  const { t } = useI18n();
  const [total, setTotal] = useState<number | null>(null);
  const [inClass, setInClass] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    listStudents()
      .then((list) => {
        if (!active) return;
        setTotal(list.length);
        setInClass(list.filter((s) => s.inClass).length);
      })
      .catch(() => {
        if (!active) return;
        setTotal(0);
        setInClass(0);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="rf-enter text-3xl font-bold">{t("teacher.dashboardTitle")}</h1>

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={t("teacher.totalStudents")}
          value={total ?? "…"}
          accent="var(--sky)"
        />
        <StatCard
          label={t("teacher.inClassCount")}
          value={inClass ?? "…"}
          accent="var(--teal)"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <NavCard
          href="/teacher/students"
          title={t("teacher.studentsTitle")}
          desc={t("teacher.studentsDesc")}
          accent="var(--tangerine)"
          delay="rf-enter-2"
        />
        <NavCard
          href="/teacher/tasks"
          title={t("teacher.tasksTitle")}
          desc={t("teacher.tasksDesc")}
          accent="var(--teal)"
          delay="rf-enter-3"
        />
      </div>
    </div>
  );
}

export default function TeacherPage() {
  return (
    <TeacherShell>
      <OverviewView />
    </TeacherShell>
  );
}

"use client";

import { useI18n } from "@/i18n/i18n";
import type { Student } from "@/lib/teacher/api";

interface Props {
  students: Student[];
  loading: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
}

export function TeacherStudents({ students, loading, onAdd, onRemove }: Props) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{t("teacher.studentsTitle")}</h2>

      {loading ? (
        <p className="text-foreground/60">{t("common.loading")}</p>
      ) : students.length === 0 ? (
        <p className="rounded-xl border border-dashed border-foreground/15 py-8 text-center text-foreground/60">
          {t("teacher.noStudents")}
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border border-foreground/10 p-3"
            >
              <span className="min-w-0 flex-1 truncate">{s.email}</span>
              {s.inClass ? (
                <>
                  <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    {t("teacher.inClass")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    className="rounded-md border border-rose-300 px-3 py-1.5 text-sm text-rose-700 transition-colors hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  >
                    {t("teacher.removeFromClass")}
                  </button>
                </>
              ) : (
                <>
                  <span className="rounded-md bg-foreground/10 px-2 py-0.5 text-xs font-medium text-foreground/60">
                    {t("teacher.waiting")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd(s.id)}
                    className="rounded-md bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
                  >
                    {t("teacher.addToClass")}
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

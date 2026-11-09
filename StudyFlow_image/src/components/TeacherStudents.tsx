"use client";

import { useI18n } from "@/i18n/i18n";
import type { Student } from "@/lib/teacher/api";

interface Props {
  students: Student[];
  loading: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TeacherStudents({
  students,
  loading,
  onAdd,
  onRemove,
  onDelete,
}: Props) {
  const { t } = useI18n();

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-bold">{t("teacher.studentsTitle")}</h2>

      {loading ? (
        <p className="text-ink/60">{t("common.loading")}</p>
      ) : students.length === 0 ? (
        <p className="rf-card-dashed py-8 text-center text-ink/60">
          {t("teacher.noStudents")}
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-2 rf-card p-3"
            >
              <span className="min-w-0 flex-1 truncate font-semibold">
                {s.lastName} {s.firstName}
                <span className="ml-2 text-xs font-normal text-ink/50">{s.phone}</span>
              </span>
              {s.inClass ? (
                <>
                  <span className="rf-badge" style={{ backgroundColor: "var(--teal)", color: "#fff" }}>
                    {t("teacher.inClass")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemove(s.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    {t("teacher.removeFromClass")}
                  </button>
                </>
              ) : (
                <>
                  <span className="rf-badge" style={{ backgroundColor: "var(--surface)", color: "var(--ink)" }}>
                    {t("teacher.waiting")}
                  </span>
                  <button
                    type="button"
                    onClick={() => onAdd(s.id)}
                    className="btn btn-primary btn-sm"
                  >
                    {t("teacher.addToClass")}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => onDelete(s.id)}
                className="btn btn-danger btn-sm"
                title={t("teacher.deleteAccount")}
              >
                {t("teacher.deleteAccount")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { TeacherShell } from "@/components/TeacherShell";
import { TeacherStudents } from "@/components/TeacherStudents";
import { TeacherTasks } from "@/components/TeacherTasks";
import {
  addStudent,
  listStudents,
  removeStudent,
  type Student,
} from "@/lib/teacher/api";

function TeacherView() {
  const { t } = useI18n();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    listStudents()
      .then(setStudents)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => reload(), [reload]);

  const handleAdd = useCallback(
    async (id: string) => {
      await addStudent(id);
      reload();
    },
    [reload],
  );

  const handleRemove = useCallback(
    async (id: string) => {
      if (!window.confirm(t("teacher.confirmRemove"))) return;
      await removeStudent(id);
      reload();
    },
    [reload, t],
  );

  const members = students.filter((s) => s.inClass);

  return (
    <>
      <h1 className="text-2xl font-semibold">{t("teacher.dashboardTitle")}</h1>
      <TeacherStudents
        students={students}
        loading={loading}
        onAdd={handleAdd}
        onRemove={handleRemove}
      />
      <TeacherTasks members={members} />
    </>
  );
}

export default function TeacherPage() {
  return (
    <TeacherShell>
      <TeacherView />
    </TeacherShell>
  );
}

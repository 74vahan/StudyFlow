"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { TeacherShell } from "@/components/TeacherShell";
import { TeacherStudents } from "@/components/TeacherStudents";
import {
  addStudent,
  deleteStudentAccount,
  listStudents,
  removeStudent,
  type Student,
} from "@/lib/teacher/api";

function StudentsView() {
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

  const handleDelete = useCallback(
    async (id: string) => {
      if (!window.confirm(t("teacher.confirmDeleteAccount"))) return;
      await deleteStudentAccount(id);
      reload();
    },
    [reload, t],
  );

  return (
    <>
      <h1 className="rf-enter text-3xl font-bold">{t("teacher.studentsTitle")}</h1>
      <TeacherStudents
        students={students}
        loading={loading}
        onAdd={handleAdd}
        onRemove={handleRemove}
        onDelete={handleDelete}
      />
    </>
  );
}

export default function TeacherStudentsPage() {
  return (
    <TeacherShell>
      <StudentsView />
    </TeacherShell>
  );
}

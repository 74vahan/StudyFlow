"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { TeacherShell } from "@/components/TeacherShell";
import { TeacherTasks } from "@/components/TeacherTasks";
import { listStudents, type Student } from "@/lib/teacher/api";

function TasksView() {
  const { t } = useI18n();
  const [members, setMembers] = useState<Student[]>([]);

  useEffect(() => {
    let active = true;
    listStudents()
      .then((list) => {
        if (active) setMembers(list.filter((s) => s.inClass));
      })
      .catch(() => {
        if (active) setMembers([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <h1 className="rf-enter text-3xl font-bold">{t("teacher.tasksTitle")}</h1>
      <TeacherTasks members={members} />
    </>
  );
}

export default function TeacherTasksPage() {
  return (
    <TeacherShell>
      <TasksView />
    </TeacherShell>
  );
}

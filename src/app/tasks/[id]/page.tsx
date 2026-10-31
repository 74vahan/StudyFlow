"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { TaskForm } from "@/components/TaskForm";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { getTask, updateTask } from "@/lib/tasks/store";
import type { Task, TaskInput } from "@/lib/tasks/types";

function EditTaskView() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getTask(user!.id, params.id).then((found) => {
      if (!active) return;
      setTask(found);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user, params.id]);

  async function handleSubmit(input: TaskInput) {
    await updateTask(user!.id, params.id, input);
    router.push("/tasks");
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("task.editTitle")}</h1>
      <TaskForm
        initial={task}
        submitLabel={t("common.update")}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/tasks")}
      />
    </div>
  );
}

export default function EditTaskPage() {
  return (
    <AppShell>
      <EditTaskView />
    </AppShell>
  );
}

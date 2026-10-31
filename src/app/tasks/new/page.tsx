"use client";

import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { TaskForm } from "@/components/TaskForm";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { createTask } from "@/lib/tasks/store";
import type { TaskInput } from "@/lib/tasks/types";

function NewTaskView() {
  const { t } = useI18n();
  const { user } = useAuth();
  const router = useRouter();

  async function handleSubmit(input: TaskInput) {
    await createTask(user!.id, input);
    router.push("/tasks");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("task.new")}</h1>
      <TaskForm
        submitLabel={t("common.create")}
        onSubmit={handleSubmit}
        onCancel={() => router.push("/tasks")}
      />
    </div>
  );
}

export default function NewTaskPage() {
  return (
    <AppShell>
      <NewTaskView />
    </AppShell>
  );
}

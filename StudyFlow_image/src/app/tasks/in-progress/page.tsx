"use client";

import { AppShell } from "@/components/AppShell";
import { StudentTasksView } from "@/components/StudentTasksView";

export default function TasksInProgressPage() {
  return (
    <AppShell>
      <StudentTasksView status="in_progress" />
    </AppShell>
  );
}

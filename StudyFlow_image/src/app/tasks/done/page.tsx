"use client";

import { AppShell } from "@/components/AppShell";
import { StudentTasksView } from "@/components/StudentTasksView";

export default function TasksDonePage() {
  return (
    <AppShell>
      <StudentTasksView status="done" />
    </AppShell>
  );
}

"use client";

import { AppShell } from "@/components/AppShell";
import { StudentTasksView } from "@/components/StudentTasksView";

// Default tasks page = the "To do" tab.
export default function TasksPage() {
  return (
    <AppShell>
      <StudentTasksView status="todo" />
    </AppShell>
  );
}

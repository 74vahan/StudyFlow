"use client";

// Client helpers for the teacher's student-management screen.

export interface Student {
  id: string;
  email: string;
  inClass: boolean;
  joinedAt: string | null;
}

export async function listStudents(): Promise<Student[]> {
  const res = await fetch("/api/teacher/students", { cache: "no-store" });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = (await res.json()) as { students: Student[] };
  return data.students;
}

export async function addStudent(id: string): Promise<void> {
  const res = await fetch(`/api/teacher/students/${id}`, { method: "POST" });
  if (!res.ok) throw new Error(`Add failed: ${res.status}`);
}

export async function removeStudent(id: string): Promise<void> {
  const res = await fetch(`/api/teacher/students/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Remove failed: ${res.status}`);
}

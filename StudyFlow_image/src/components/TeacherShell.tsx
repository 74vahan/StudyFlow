"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Layout + guard for the teacher area. Redirects non-teachers to the PIN login.
export function TeacherShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && user?.role !== "teacher") router.replace("/teacher/login");
  }, [ready, user, router]);

  if (!ready || user?.role !== "teacher") {
    return (
      <main className="flex flex-1 items-center justify-center p-6 text-foreground/60">
        {t("common.loading")}
      </main>
    );
  }

  const links = [
    { href: "/teacher", label: t("teacher.overview"), exact: true },
    { href: "/teacher/students", label: t("teacher.studentsTitle") },
    { href: "/teacher/tasks", label: t("teacher.tasksTitle") },
  ];

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b-[4px] border-ink bg-surface/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3 sm:px-6">
          <Link href="/teacher" className="text-xl font-bold tracking-tight text-tangerine">
            {t("app.name")}
          </Link>
          <span className="rf-badge" style={{ backgroundColor: "var(--teal)", color: "#fff" }}>
            {t("role.teacher")}
          </span>
          <nav className="flex items-center gap-2">
            {links.map((link) => {
              const active = link.exact
                ? pathname === link.href
                : pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rf-navlink text-sm ${active ? "rf-navlink-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/teacher/login");
              }}
              className="btn btn-secondary btn-sm"
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-10 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}

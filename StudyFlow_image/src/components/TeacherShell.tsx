"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// Layout + guard for the teacher area. Redirects non-teachers to the PIN login.
export function TeacherShell({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const { user, ready, logout } = useAuth();
  const router = useRouter();

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

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-foreground/10 bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="text-lg font-semibold">{t("app.name")}</span>
          <span className="rounded-md bg-foreground/10 px-2 py-0.5 text-xs font-medium">
            {t("role.teacher")}
          </span>
          <div className="ml-auto flex items-center gap-3">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/teacher/login");
              }}
              className="rounded-md border border-foreground/15 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-foreground/5"
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

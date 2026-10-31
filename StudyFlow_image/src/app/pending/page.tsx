"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function PendingPage() {
  const { t } = useI18n();
  const { user, inClass, ready, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else if (user.role === "teacher") router.replace("/teacher");
    else if (inClass) router.replace("/dashboard");
  }, [ready, user, inClass, router]);

  return (
    <main className="flex min-h-full flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
        <p className="text-7xl font-bold text-foreground/15 select-none">404</p>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{t("pending.title")}</h1>
          <p className="max-w-md text-balance text-foreground/70">
            {t("pending.message")}
          </p>
          <p className="text-sm text-foreground/50">{t("pending.hint")}</p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("pending.refresh")}
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.replace("/login");
            }}
            className="rounded-md border border-foreground/15 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            {t("nav.logout")}
          </button>
        </div>
      </section>
    </main>
  );
}

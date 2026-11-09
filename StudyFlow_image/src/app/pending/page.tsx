"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { SnakeGame } from "@/components/SnakeGame";

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
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-paper text-ink">
      {/* Playable Snake running in the background */}
      <SnakeGame />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-tangerine">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="rf-card rf-enter w-full max-w-md p-8 text-center">
          <h1 className="text-3xl font-bold">{t("pending.title")}</h1>
          <p className="mt-2 text-balance text-ink/70">{t("pending.message")}</p>
          <p className="mt-1 text-sm text-ink/50">{t("pending.hint")}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn btn-primary btn-sm"
            >
              {t("pending.refresh")}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="btn btn-secondary btn-sm"
            >
              {t("nav.logout")}
            </button>
          </div>

          <p className="mt-5 text-xs font-semibold text-ink/50">{t("pending.play")}</p>
        </div>
      </section>
    </main>
  );
}

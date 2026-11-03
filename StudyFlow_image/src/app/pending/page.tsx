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
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden bg-[#0b0f0d] text-white">
      {/* Playable Snake running in the background */}
      <SnakeGame />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/55 p-8 text-center shadow-xl backdrop-blur-sm">
          <h1 className="text-2xl font-semibold">{t("pending.title")}</h1>
          <p className="mt-2 text-balance text-white/70">{t("pending.message")}</p>
          <p className="mt-1 text-sm text-white/50">{t("pending.hint")}</p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-[#0b0f0d] transition-opacity hover:opacity-90"
            >
              {t("pending.refresh")}
            </button>
            <button
              type="button"
              onClick={async () => {
                await logout();
                router.replace("/login");
              }}
              className="rounded-md border border-white/25 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {t("nav.logout")}
            </button>
          </div>

          <p className="mt-5 text-xs text-white/40">{t("pending.play")}</p>
        </div>
      </section>
    </main>
  );
}

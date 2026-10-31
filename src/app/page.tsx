"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function Home() {
  const { t } = useI18n();
  const { user, ready } = useAuth();
  const router = useRouter();

  // Signed-in users skip the landing and go straight to the app.
  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold sm:text-5xl">{t("app.name")}</h1>
          <p className="max-w-md text-balance text-foreground/70">
            {t("app.tagline")}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {t("nav.register")}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-foreground/15 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            {t("nav.login")}
          </Link>
        </div>
      </section>

      <footer className="px-6 py-4 text-center text-xs text-foreground/50">
        StudyFlow · Vibe Coding
      </footer>
    </main>
  );
}

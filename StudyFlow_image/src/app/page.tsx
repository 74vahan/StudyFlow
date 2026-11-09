"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Starburst, AtomBadge } from "@/components/RetroDecor";

export default function Home() {
  const { t } = useI18n();
  const { user, inClass, ready } = useAuth();
  const router = useRouter();

  // Signed-in users skip the landing and go to their home.
  useEffect(() => {
    if (!ready || !user) return;
    if (user.role === "teacher") router.replace("/teacher");
    else if (inClass) router.replace("/dashboard");
    else router.replace("/pending");
  }, [ready, user, inClass, router]);

  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      {/* decorative starbursts scattered Googie-style */}
      <Starburst
        className="rf-float pointer-events-none absolute left-6 top-28 opacity-80"
        size={48}
        color="var(--teal)"
      />
      <Starburst
        className="rf-float pointer-events-none absolute bottom-16 right-10 opacity-80"
        size={70}
        color="var(--tangerine)"
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-tangerine">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center gap-7 px-6 py-10 text-center">
        <AtomBadge className="rf-enter" size={110} />

        <h1 className="rf-enter-2 text-5xl font-bold leading-tight sm:text-7xl">
          <span className="text-ink">Study</span>
          <span className="text-tangerine">Flow</span>
        </h1>

        <p className="rf-enter-2 max-w-md text-balance text-lg text-ink/70">
          {t("app.tagline")}
        </p>

        <div className="rf-enter-3 flex flex-wrap items-center justify-center gap-4">
          <Link href="/register" className="btn btn-primary text-base">
            {t("nav.register")}
          </Link>
          <Link href="/login" className="btn btn-secondary text-base">
            {t("nav.login")}
          </Link>
        </div>

        <Link
          href="/teacher/login"
          className="rf-enter-3 font-semibold text-teal underline underline-offset-4"
        >
          {t("auth.teacherLink")}
        </Link>
      </section>

      <footer className="relative z-10 border-t-[3px] border-ink px-6 py-4 text-center text-xs font-semibold text-ink/60">
        StudyFlow · Vibe Coding
      </footer>
    </main>
  );
}

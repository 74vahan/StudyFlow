"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Caveat } from "next/font/google";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const caveat = Caveat({ subsets: ["latin"], weight: ["700"] });

// The handwriting is drawn by animating the stroke along the glyph outlines
// (stroke-dashoffset), so it looks like a pen writing and leaving a trail; a
// filled copy fades in once the outline is complete.
const styles = `
.welcome-svg { width: min(90vw, 620px); height: auto; display: block; }
.welcome-stroke {
  fill: none;
  stroke: #ffffff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 3200;
  stroke-dashoffset: 3200;
  /* play once and keep the final state (forwards), no loop */
  animation: welcome-draw 3.2s ease-in-out forwards;
}
.welcome-fill {
  fill: #ffffff;
  opacity: 0;
  /* fade the solid fill in as the outline finishes, then stay */
  animation: welcome-fill 1.2s ease-in 2.4s forwards;
}
@keyframes welcome-draw {
  to { stroke-dashoffset: 0; }
}
@keyframes welcome-fill {
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  .welcome-stroke { animation: none; stroke-dashoffset: 0; }
  .welcome-fill { animation: none; opacity: 1; }
}
`;

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

  const fontFamily = caveat.style.fontFamily;

  return (
    <main className="flex min-h-full flex-1 flex-col bg-black text-white">
      <style>{styles}</style>

      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">{t("app.name")}</span>
        <LanguageSwitcher />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
        <svg
          className="welcome-svg"
          viewBox="0 0 1000 320"
          role="img"
          aria-label="Welcome"
        >
          <text
            className="welcome-stroke"
            x="500"
            y="210"
            textAnchor="middle"
            style={{ fontFamily, fontSize: "220px" }}
          >
            Welcome
          </text>
          <text
            className="welcome-fill"
            x="500"
            y="210"
            textAnchor="middle"
            style={{ fontFamily, fontSize: "220px" }}
          >
            Welcome
          </text>
        </svg>

        <p className="max-w-md text-balance text-white/60">{t("app.tagline")}</p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/register"
            className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            {t("nav.register")}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-white/30 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            {t("nav.login")}
          </Link>
        </div>

        <Link
          href="/teacher/login"
          className="text-sm text-white/50 underline underline-offset-4 hover:text-white"
        >
          {t("auth.teacherLink")}
        </Link>
      </section>

      <footer className="px-6 py-4 text-center text-xs text-white/40">
        StudyFlow · Vibe Coding
      </footer>
    </main>
  );
}

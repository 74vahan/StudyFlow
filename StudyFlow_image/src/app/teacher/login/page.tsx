"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Starburst } from "@/components/RetroDecor";

const field = "rf-field text-center text-2xl tracking-[0.5em]";

export default function TeacherLoginPage() {
  const { t } = useI18n();
  const { user, ready, teacherLogin } = useAuth();
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user?.role === "teacher") router.replace("/teacher");
  }, [ready, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(pin)) {
      setError(t("teacher.pinFormat"));
      return;
    }
    setSubmitting(true);
    const result = await teacherLogin(pin);
    setSubmitting(false);
    if (result.ok) {
      router.replace("/teacher");
    } else {
      setError(result.error === "locked" ? t("teacher.pinLocked") : t("teacher.pinInvalid"));
    }
  }

  return (
    <main className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-tangerine">
          {t("app.name")}
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="rf-card rf-enter relative w-full max-w-sm space-y-4 p-6"
          noValidate
        >
          <Starburst
            className="rf-float pointer-events-none absolute -left-5 -top-6"
            size={52}
            color="var(--teal)"
          />
          <h1 className="text-2xl font-bold">{t("teacher.loginTitle")}</h1>

          <div>
            <label htmlFor="pin" className="mb-1 block text-sm font-semibold">
              {t("teacher.pin")}
            </label>
            <input
              id="pin"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className={field}
            />
          </div>

          {error && <p className="text-sm font-semibold text-coral">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-accent w-full"
          >
            {submitting ? t("common.saving") : t("teacher.pinCta")}
          </button>

          <p className="text-center text-sm text-ink/60">
            <Link href="/login" className="font-semibold text-teal underline underline-offset-4">
              {t("auth.studentLink")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

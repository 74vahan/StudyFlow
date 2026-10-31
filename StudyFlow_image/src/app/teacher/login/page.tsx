"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n/i18n";
import { useAuth } from "@/lib/auth/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const field =
  "w-full rounded-md border border-foreground/15 bg-background px-3 py-2 text-center text-lg tracking-[0.5em] outline-none focus:border-foreground/40";

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
        <Link href="/" className="text-lg font-semibold">
          {t("app.name")}
        </Link>
        <LanguageSwitcher />
      </header>

      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-4 rounded-xl border border-foreground/10 p-6"
          noValidate
        >
          <h1 className="text-xl font-semibold">{t("teacher.loginTitle")}</h1>

          <div>
            <label htmlFor="pin" className="mb-1 block text-sm font-medium">
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

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? t("common.saving") : t("teacher.pinCta")}
          </button>

          <p className="text-center text-sm text-foreground/60">
            <Link href="/login" className="underline">
              {t("auth.studentLink")}
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}

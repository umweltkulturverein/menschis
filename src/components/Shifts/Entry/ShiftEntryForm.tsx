"use client";

import { inputClass, labelClass } from "@/components/Misc/Form/FormModal";
import FormActions from "@/components/Misc/Form/FormActions";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

interface EntryForm {
  name: string;
  email: string;
  phone: string;
  notes: string;
  captchaChallenge?: string;
}

interface Props {
  form: EntryForm;
  submitting: boolean;
  error?: string | null;
  edit?: boolean;
  onChange: (form: EntryForm) => void;
  onCancel: () => void;
  onConfirm: () => void;
  turnstileSiteKey: string | undefined;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

declare global {
  interface Window {
    onCaptchaSuccess: (token: string) => void;
    onCaptchaExpired: () => void;
    turnstile?: {
      render: (el: HTMLElement) => void;
    };
  }
}

export default function ShiftEntryForm({
  form,
  submitting,
  error,
  edit,
  onChange,
  onCancel,
  onConfirm,
  turnstileSiteKey,
}: Props) {
  const t = useTranslations("Entry");
  const tf = useTranslations("Forms");
  const trimmedEmail = form.email.trim();
  const emailValid = EMAIL_REGEX.test(trimmedEmail);
  const showEmailError = !edit && trimmedEmail.length > 0 && !emailValid;
  const widgetRef = useRef<HTMLDivElement>(null);
  const formRef = useRef(form);
  const { data: session } = useSession();
  const showCaptcha = !edit && !!turnstileSiteKey && !session;
  const onChangeRef = useRef(onChange);
  formRef.current = form;
  onChangeRef.current = onChange;

  useEffect(() => {
    // Register the callbacks BEFORE asking Turnstile to render — Cloudflare
    // may short-circuit and fire onCaptchaSuccess synchronously when a
    // clearance cookie is present.
    window.onCaptchaSuccess = (token: string) =>
      onChangeRef.current({ ...formRef.current, captchaChallenge: token });
    window.onCaptchaExpired = () =>
      onChangeRef.current({ ...formRef.current, captchaChallenge: undefined });

    // The api.js auto-scan only runs once on script load. If the script is
    // already loaded (e.g. the form was opened before), render explicitly.
    if (turnstileSiteKey && widgetRef.current && window.turnstile) {
      window.turnstile.render(widgetRef.current);
    }
  }, [turnstileSiteKey]);
  return (
    <div
      className={
        edit
          ? "mx-4 mt-2 mb-4 p-3 space-y-3 rounded-md border border-yellow-400 bg-yellow-50 dark:bg-yellow-950/40"
          : "px-4 pb-4 pt-2 space-y-3"
      }
    >
      <div>
        <label className={labelClass}>{t("name")} *</label>
        <input
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder={t("name")}
          required
          className={inputClass}
        />
      </div>
      {!edit && (
        <>
          <div>
            <label className={labelClass}>{t("email")} *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              placeholder={t("email")}
              required
              aria-invalid={showEmailError}
              className={inputClass}
            />
            {showEmailError ? (
              <p className="mt-1 text-xs text-red-500">
                {t("emailInvalid")}
              </p>
            ) : null}
          </div>
        </>
      )}
      <div>
        <label className={labelClass}>{t("phone")}</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => onChange({ ...form, phone: e.target.value })}
          placeholder={t("phonePlaceholder")}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{t("note")}</label>
        <textarea
          value={form.notes}
          onChange={(e) => onChange({ ...form, notes: e.target.value })}
          placeholder={t("notePlaceholder")}
          rows={2}
          className={`${inputClass} resize-none`}
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <FormActions
        cancelLabel={t("cancel")}
        confirmLabel={edit ? tf("save") : t("confirm")}
        submitting={submitting}
        disabled={
          !form.name.trim() ||
          (!edit && !emailValid) ||
          (showCaptcha && !form.captchaChallenge)
        }
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
      {showCaptcha && (
        <div className="flex mt-8 justify-center items-center captcha">
          <div
            ref={widgetRef}
            className="cf-turnstile"
            data-sitekey={turnstileSiteKey}
            data-size="compact"
            data-callback="onCaptchaSuccess"
            data-expired-callback="onCaptchaExpired"
          ></div>
        </div>
      )}
    </div>
  );
}

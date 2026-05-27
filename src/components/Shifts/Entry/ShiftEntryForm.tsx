"use client";

import { inputClass, labelClass } from "@/components/Misc/FormModal";
import {useEffect, useRef} from "react";

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
    onChange,
    onCancel,
    onConfirm,
    turnstileSiteKey
}: Props) {
    const trimmedEmail = form.email.trim();
    const emailValid = EMAIL_REGEX.test(trimmedEmail);
    const showEmailError = trimmedEmail.length > 0 && !emailValid;
    const widgetRef = useRef<HTMLDivElement>(null);
    const formRef = useRef(form);
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
        <div className="px-4 pb-4 pt-2 space-y-3">
            <div>
                <label className={labelClass}>Name *</label>
                <input
                    value={form.name}
                    onChange={(e) =>
                        onChange({...form, name: e.target.value})
                    }
                    placeholder="Name"
                    required
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>E-Mail *</label>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                        onChange({...form, email: e.target.value})
                    }
                    placeholder="E-Mail"
                    required
                    aria-invalid={showEmailError}
                    className={inputClass}
                />
                {showEmailError ? (
                    <p className="mt-1 text-xs text-red-500">
                        Bitte gib eine gültige E-Mail-Adresse ein.
                    </p>
                ) : null}
            </div>
            <div>
                <label className={labelClass}>Telefon</label>
                <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) =>
                        onChange({...form, phone: e.target.value})
                    }
                    placeholder="Telefon (optional)"
                    className={inputClass}
                />
            </div>
            <div>
                <label className={labelClass}>Notiz</label>
                <textarea
                    value={form.notes}
                    onChange={(e) =>
                        onChange({...form, notes: e.target.value})
                    }
                    placeholder="Notiz (optional)"
                    rows={2}
                    className={`${inputClass} resize-none`}
                />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={onCancel}
                    className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-ci-blue-600"
                >
                    Abbrechen
                </button>
                <button
                    onClick={onConfirm}
                    disabled={
                        submitting ||
                        !form.name.trim() ||
                        !emailValid ||
                        (!!turnstileSiteKey && !form.captchaChallenge)
                    }
                    className="flex-1 text-sm px-3 py-1.5 rounded-md bg-green-500 hover:bg-green-600 text-white font-medium disabled:opacity-50"
                >
                    {submitting ? "..." : "Bestätigen"}
                </button>
            </div>
            {turnstileSiteKey && (
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

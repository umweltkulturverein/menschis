import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.edge";
import nodemailer, { type Transporter } from "nodemailer";
import { getLocale, getTranslations } from "next-intl/server";
import type { EventItem } from "@/types/event";
import type { EventDay } from "@/types/eventDay";
import type { Shift, ShiftEntry, ShiftKind } from "@/types/shift";
import { EnsureLoginToken, type Person } from "@/lib/db/persons";
import { DEFAULT_LOCALE, DATE_LOCALE, type Locale } from "@/i18n/config";
import { MagicLinkEmail } from "./templates/MagicLinkEmail";
import { ShiftEntryEmail } from "./templates/ShiftEntryEmail";

/**
 * Resolves the recipient-facing locale and a translator for email content.
 * Emails are sent within request scope (auth/entry routes), so the request's
 * locale is used; if unavailable, falls back to the default locale.
 */
async function emailLocale(): Promise<{
    locale: Locale;
    t: Awaited<ReturnType<typeof getTranslations<"Emails">>>;
}> {
    let locale: Locale = DEFAULT_LOCALE;
    try {
        locale = (await getLocale()) as Locale;
    } catch {
        locale = DEFAULT_LOCALE;
    }
    const t = await getTranslations({ locale, namespace: "Emails" });
    return { locale, t };
}

let cachedTransport: Transporter | null = null;
let cachedTransportKey: string | null = null;

function getTransport(user: string | undefined): Transporter | null {
    const host = process.env.SMTP_HOST;
    if (!host) return null;

    const port = Number(process.env.SMTP_PORT ?? 587);
    const pass = process.env.SMTP_PASS;
    const secure = process.env.SMTP_SECURE === "true" || port === 465;

    const key = `${host}|${port}|${secure}|${user ?? ""}`;
    if (cachedTransport && cachedTransportKey === key) return cachedTransport;

    cachedTransport = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: user && pass ? { user, pass } : undefined,
    });
    cachedTransportKey = key;
    return cachedTransport;
}

export function buildMagicLinkUrl(
    loginToken: string,
    redirectPath?: string,
): string {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const redirect = redirectPath
        ? `&redirect=${encodeURIComponent(redirectPath)}`
        : "";
    return `${base}/api/auth/magic?token=${loginToken}${redirect}`;
}

async function sendMail(opts: {
    to: string;
    subject: string;
    html: string;
    text: string;
}): Promise<void> {
    const user = process.env.SMTP_USER;
    const transport = getTransport(user);
    const from = process.env.SMTP_FROM;
    const replyTo = process.env.SMTP_REPLY_TO;

    if (!transport || !from && !user) {
        console.warn(
            `[email] SMTP not configured (need SMTP_HOST and SMTP_FROM/SMTP_USER) — would have sent "${opts.subject}" to ${opts.to}`,
        );
        return;
    }

    await transport.sendMail({
        from: from ?? user,
        to: opts.to,
        replyTo: replyTo ?? from,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
    });
}

export async function sendMagicLink(
    email: string,
    loginToken: string,
    redirectPath?: string,
    recipientName?: string,
): Promise<void> {
    const url = buildMagicLinkUrl(loginToken, redirectPath);
    const { locale, t } = await emailLocale();

    const subject = t("magicLink.subject");
    const html =
        "<!DOCTYPE html>" +
        renderToStaticMarkup(
            createElement(MagicLinkEmail, { url, recipientName, locale, t }),
        );
    const text = [
        recipientName
            ? t("magicLink.greeting", { name: recipientName })
            : t("magicLink.greetingPlain"),
        "",
        t("magicLink.textBody"),
        url,
        "",
        t("magicLink.textIgnore"),
        "",
        t("magicLink.signature"),
    ].join("\n");

    await sendMail({ to: email, subject, html, text });
}

function formatShiftRange(shift: Shift, locale: Locale, clock: string): string {
    const start = new Date(shift.startDatetime);
    const end = new Date(shift.endDatetime);
    const tag = DATE_LOCALE[locale];
    const dateFmt: Intl.DateTimeFormatOptions = {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    };
    const timeFmt: Intl.DateTimeFormatOptions = {
        hour: "2-digit",
        minute: "2-digit",
    };
    const sameDay = start.toDateString() === end.toDateString();
    if (sameDay) {
        return `${start.toLocaleDateString(tag, dateFmt)}, ${start.toLocaleTimeString(tag, timeFmt)} – ${end.toLocaleTimeString(tag, timeFmt)}${clock}`;
    }
    return `${start.toLocaleDateString(tag, dateFmt)} ${start.toLocaleTimeString(tag, timeFmt)} – ${end.toLocaleDateString(tag, dateFmt)} ${end.toLocaleTimeString(tag, timeFmt)}${clock}`;
}

export async function sendShiftEntryEmail(args: {
    entry: ShiftEntry;
    person: Person;
    shift: Shift;
    shiftKind: ShiftKind;
    event: EventItem;
    eventDay?: EventDay | null;
}): Promise<void> {
    const loginToken = await EnsureLoginToken(args.person.id);
    const editUrl = buildMagicLinkUrl(loginToken, `/events/${args.event.id}`);
    const { locale, t } = await emailLocale();

    const subject = t("shiftEntry.subject", { title: args.event.title });
    const html =
        "<!DOCTYPE html>" +
        renderToStaticMarkup(
            createElement(ShiftEntryEmail, {
                entry: args.entry,
                shift: args.shift,
                shiftKind: args.shiftKind,
                event: args.event,
                eventDay: args.eventDay ?? null,
                editUrl,
                locale,
                t,
            }),
        );

    const lines: string[] = [
        t("shiftEntry.greeting", { name: args.entry.name }),
        "",
        t("shiftEntry.textIntro", {
            kind: args.shiftKind.title,
            event: args.event.title,
        }),
        "",
        `${t("shiftEntry.labelEvent")}: ${args.event.title}`,
    ];
    if (args.eventDay)
        lines.push(`${t("shiftEntry.labelDay")}: ${args.eventDay.dayTitle}`);
    lines.push(`${t("shiftEntry.labelShift")}: ${args.shiftKind.title}`);
    lines.push(
        `${t("shiftEntry.labelTime")}: ${formatShiftRange(args.shift, locale, t("shiftEntry.clockSuffix"))}`,
    );
    lines.push(`${t("shiftEntry.labelLocation")}: ${args.event.location}`);
    lines.push(`${t("shiftEntry.labelName")}: ${args.entry.name}`);
    if (args.entry.notes)
        lines.push(`${t("shiftEntry.labelNote")}: ${args.entry.notes}`);
    if (args.shiftKind.description) {
        lines.push(
            "",
            t("shiftEntry.textDescription", {
                description: args.shiftKind.description,
            }),
        );
    }
    if (args.event.infoText) {
        lines.push("", args.event.infoText);
    }
    lines.push("", t("shiftEntry.textCta"), editUrl, "", t("shiftEntry.signature"));

    await sendMail({ to: args.person.email, subject, html, text: lines.join("\n") });
}

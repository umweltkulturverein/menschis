import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.edge";
import nodemailer, { type Transporter } from "nodemailer";
import type { EventItem } from "@/types/event";
import type { EventDay } from "@/types/eventDay";
import type { Shift, ShiftEntry, ShiftKind } from "@/types/shift";
import { EnsureLoginToken, type Person } from "@/lib/db/persons";
import { MagicLinkEmail } from "./templates/MagicLinkEmail";
import { ShiftEntryEmail } from "./templates/ShiftEntryEmail";

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

    const subject = "Dein Login-Link für Menschis";
    const html =
        "<!DOCTYPE html>" +
        renderToStaticMarkup(createElement(MagicLinkEmail, { url, recipientName }));
    const text = [
        recipientName ? `Hallo ${recipientName},` : "Hallo,",
        "",
        "klicke auf den folgenden Link, um dich bei Menschis anzumelden:",
        url,
        "",
        "Wenn du diese E-Mail nicht angefordert hast, kannst du sie einfach ignorieren.",
        "",
        "— Das Menschis-Team",
    ].join("\n");

    await sendMail({ to: email, subject, html, text });
}

function formatShiftRange(shift: Shift): string {
    const start = new Date(shift.startDatetime);
    const end = new Date(shift.endDatetime);
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
        return `${start.toLocaleDateString("de-DE", dateFmt)}, ${start.toLocaleTimeString("de-DE", timeFmt)} – ${end.toLocaleTimeString("de-DE", timeFmt)} Uhr`;
    }
    return `${start.toLocaleDateString("de-DE", dateFmt)} ${start.toLocaleTimeString("de-DE", timeFmt)} – ${end.toLocaleDateString("de-DE", dateFmt)} ${end.toLocaleTimeString("de-DE", timeFmt)} Uhr`;
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

    const subject = `${args.event.title} Schicht bestätigt`;
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
            }),
        );

    const lines: string[] = [
        `Hallo ${args.entry.name},`,
        "",
        `deine Anmeldung für "${args.shiftKind.title}" bei "${args.event.title}" ist gespeichert.`,
        "",
        `Event: ${args.event.title}`,
    ];
    if (args.eventDay) lines.push(`Tag: ${args.eventDay.dayTitle}`);
    lines.push(`Schicht: ${args.shiftKind.title}`);
    lines.push(`Zeit: ${formatShiftRange(args.shift)}`);
    lines.push(`Ort: ${args.event.location}`);
    lines.push(`Name: ${args.entry.name}`);
    if (args.entry.notes) lines.push(`Notiz: ${args.entry.notes}`);
    if (args.shiftKind.description) {
        lines.push("", `Beschreibung: ${args.shiftKind.description}`);
    }
    if (args.event.infoText) {
        lines.push("", args.event.infoText);
    }
    lines.push(
        "",
        "Schicht ansehen oder bearbeiten:",
        editUrl,
        "",
        "— Das Menschis-Team",
    );

    await sendMail({ to: args.person.email, subject, html, text: lines.join("\n") });
}

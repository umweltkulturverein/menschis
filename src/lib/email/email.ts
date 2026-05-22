import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server.edge";
import nodemailer, { type Transporter } from "nodemailer";
import { MagicLinkEmail } from "./templates/MagicLinkEmail";

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
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const url = `${base}/api/auth/magic?token=${loginToken}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`;

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

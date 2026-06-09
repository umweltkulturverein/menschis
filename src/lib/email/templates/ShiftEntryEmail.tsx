import type { CSSProperties } from "react";
import type { getTranslations } from "next-intl/server";
import type { EventItem } from "@/types/event";
import type { EventDay } from "@/types/eventDay";
import type { Shift, ShiftEntry, ShiftKind } from "@/types/shift";
import { type Locale, DATE_LOCALE } from "@/i18n/config";

type EmailTranslator = Awaited<ReturnType<typeof getTranslations<"Emails">>>;

type Props = {
    entry: ShiftEntry;
    shift: Shift;
    shiftKind: ShiftKind;
    event: EventItem;
    eventDay?: EventDay | null;
    editUrl: string;
    locale: Locale;
    t: EmailTranslator;
};

function formatDate(date: Date, locale: Locale): string {
    return new Date(date).toLocaleDateString(DATE_LOCALE[locale], {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(date: Date, locale: Locale): string {
    return new Date(date).toLocaleTimeString(DATE_LOCALE[locale], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function ShiftEntryEmail({
    entry,
    shift,
    shiftKind,
    event,
    eventDay,
    editUrl,
    locale,
    t,
}: Props) {
    const start = new Date(shift.startDatetime);
    const end = new Date(shift.endDatetime);
    const sameDay = start.toDateString() === end.toDateString();
    const clock = t("shiftEntry.clockSuffix");
    const dateLine = sameDay
        ? `${formatDate(start, locale)}, ${formatTime(start, locale)} – ${formatTime(end, locale)}${clock}`
        : `${formatDate(start, locale)} ${formatTime(start, locale)} – ${formatDate(end, locale)} ${formatTime(end, locale)}${clock}`;

    return (
        <html lang={locale}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="color-scheme" content="light dark" />
                <title>{t("shiftEntry.documentTitle", { title: event.title })}</title>
            </head>
            <body style={styles.body}>
                <span style={styles.preheader}>
                    {t("shiftEntry.preheader", { title: event.title })}
                </span>
                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.outerTable}>
                    <tbody>
                        <tr>
                            <td align="center">
                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.card}>
                                    <tbody>
                                        <tr>
                                            <td style={styles.header}>
                                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={styles.brand}>Menschis</td>
                                                            <td align="right" style={styles.headerTag}>{t("shiftEntry.tag")}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.bodyPad}>
                                                <h1 style={styles.h1}>{t("shiftEntry.heading")}</h1>
                                                <p style={styles.paragraph}>{t("shiftEntry.greeting", { name: entry.name })}</p>
                                                <p style={styles.paragraph}>
                                                    {t("shiftEntry.intro", {
                                                        kind: shiftKind.title,
                                                        event: event.title,
                                                    })}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.detailsCell}>
                                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.detailsTable}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={styles.detailLabel}>{t("shiftEntry.labelEvent")}</td>
                                                            <td style={styles.detailValue}>{event.title}</td>
                                                        </tr>
                                                        {eventDay && (
                                                            <tr>
                                                                <td style={styles.detailLabel}>{t("shiftEntry.labelDay")}</td>
                                                                <td style={styles.detailValue}>{eventDay.dayTitle}</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td style={styles.detailLabel}>{t("shiftEntry.labelShift")}</td>
                                                            <td style={styles.detailValue}>{shiftKind.title}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>{t("shiftEntry.labelTime")}</td>
                                                            <td style={styles.detailValue}>{dateLine}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>{t("shiftEntry.labelLocation")}</td>
                                                            <td style={styles.detailValue}>{event.location}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>{t("shiftEntry.labelName")}</td>
                                                            <td style={styles.detailValue}>{entry.name}</td>
                                                        </tr>
                                                        {entry.notes && (
                                                            <tr>
                                                                <td style={styles.detailLabel}>{t("shiftEntry.labelNote")}</td>
                                                                <td style={styles.detailValue}>{entry.notes}</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        {shiftKind.description && (
                                            <tr>
                                                <td style={styles.bodyPad}>
                                                    <p style={styles.smallMuted}>{t("shiftEntry.descriptionLabel")}</p>
                                                    <p style={styles.paragraph}>{shiftKind.description}</p>
                                                </td>
                                            </tr>
                                        )}
                                        {event.infoText && (
                                            <tr>
                                                <td style={styles.infoCell}>
                                                    <div style={styles.infoBox}>
                                                        {event.infoText.split(/\n+/).map((line, i) => (
                                                            <p key={i} style={styles.infoText}>{line}</p>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td align="center" style={styles.ctaCell}>
                                                <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style={styles.buttonWrap}>
                                                                <a href={editUrl} style={styles.button}>{t("shiftEntry.cta")}</a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.fallbackCell}>
                                                <p style={styles.smallMuted}>
                                                    {t("fallback")}
                                                </p>
                                                <p style={styles.fallbackLinkP}>
                                                    <a href={editUrl} style={styles.fallbackLink}>{editUrl}</a>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.footerCell}>
                                                <div style={styles.divider}>
                                                    <p style={styles.smallMuted}>
                                                        {t("shiftEntry.expiry")}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p style={styles.footer}>
                                    {t("footer")}
                                </p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </html>
    );
}

const styles = {
    body: {
        margin: 0,
        padding: 0,
        backgroundColor: "#f4f6f5",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif",
        color: "#1a1f1c",
    },
    preheader: {
        display: "none",
        visibility: "hidden",
        opacity: 0,
        color: "transparent",
        height: 0,
        width: 0,
        overflow: "hidden",
    },
    outerTable: {
        backgroundColor: "#f4f6f5",
        padding: "32px 12px",
    },
    card: {
        maxWidth: 560,
        backgroundColor: "#ffffff",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(16,24,20,0.06),0 8px 24px rgba(16,24,20,0.06)",
    },
    header: {
        background: "linear-gradient(135deg,#3aa45b 0%,#1f6b3a 100%)",
        padding: "28px 32px",
        color: "#ffffff",
    },
    brand: {
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: "-0.01em",
    },
    headerTag: {
        fontSize: 12,
        opacity: 0.85,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
    },
    bodyPad: {
        padding: "36px 32px 8px 32px",
    },
    h1: {
        margin: "0 0 12px 0",
        fontSize: 24,
        lineHeight: 1.25,
        fontWeight: 700,
        color: "#101810",
    },
    paragraph: {
        margin: "0 0 8px 0",
        fontSize: 16,
        lineHeight: 1.6,
        color: "#374038",
    },
    detailsCell: {
        padding: "16px 32px 8px 32px",
    },
    detailsTable: {
        borderCollapse: "collapse",
    },
    detailLabel: {
        padding: "8px 12px 8px 0",
        fontSize: 13,
        fontWeight: 600,
        color: "#6b7570",
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        verticalAlign: "top",
        width: "30%",
        borderBottom: "1px solid #eef2ef",
    },
    detailValue: {
        padding: "8px 0",
        fontSize: 15,
        lineHeight: 1.5,
        color: "#1a1f1c",
        verticalAlign: "top",
        borderBottom: "1px solid #eef2ef",
    },
    infoCell: {
        padding: "16px 32px 8px 32px",
    },
    infoBox: {
        backgroundColor: "#f1f8f3",
        border: "1px solid #d8eade",
        borderRadius: 10,
        padding: "16px 18px",
    },
    infoText: {
        margin: "0 0 6px 0",
        fontSize: 15,
        lineHeight: 1.6,
        color: "#1f3a26",
    },
    ctaCell: {
        padding: "16px 32px 32px 32px",
    },
    buttonWrap: {
        borderRadius: 10,
        backgroundColor: "#1f6b3a",
    },
    button: {
        display: "inline-block",
        padding: "14px 28px",
        fontSize: 16,
        fontWeight: 600,
        color: "#ffffff",
        textDecoration: "none",
        borderRadius: 10,
        backgroundColor: "#1f6b3a",
    },
    fallbackCell: {
        padding: "0 32px 24px 32px",
    },
    smallMuted: {
        margin: "0 0 8px 0",
        fontSize: 13,
        lineHeight: 1.6,
        color: "#6b7570",
    },
    fallbackLinkP: {
        margin: 0,
        fontSize: 13,
        lineHeight: 1.6,
        wordBreak: "break-all",
    },
    fallbackLink: {
        color: "#1f6b3a",
        textDecoration: "underline",
    },
    footerCell: {
        padding: "0 32px 32px 32px",
    },
    divider: {
        borderTop: "1px solid #e6ebe7",
        paddingTop: 20,
    },
    footer: {
        margin: "20px 0 0 0",
        fontSize: 12,
        lineHeight: 1.6,
        color: "#8a948e",
        textAlign: "center",
    },
} satisfies Record<string, CSSProperties>;

import type { CSSProperties } from "react";
import type { EventItem } from "@/types/event";
import type { EventDay } from "@/types/eventDay";
import type { Shift, ShiftEntry, ShiftKind } from "@/types/shift";

type Props = {
    entry: ShiftEntry;
    shift: Shift;
    shiftKind: ShiftKind;
    event: EventItem;
    eventDay?: EventDay | null;
    editUrl: string;
};

function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString("de-DE", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString("de-DE", {
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
}: Props) {
    const start = new Date(shift.startDatetime);
    const end = new Date(shift.endDatetime);
    const sameDay = start.toDateString() === end.toDateString();
    const dateLine = sameDay
        ? `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)} Uhr`
        : `${formatDate(start)} ${formatTime(start)} – ${formatDate(end)} ${formatTime(end)} Uhr`;

    return (
        <html lang="de">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="color-scheme" content="light dark" />
                <title>{`${event.title} Schicht bestätigt`}</title>
            </head>
            <body style={styles.body}>
                <span style={styles.preheader}>
                    Deine Schicht für {event.title} ist bestätigt.
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
                                                            <td align="right" style={styles.headerTag}>Schicht</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.bodyPad}>
                                                <h1 style={styles.h1}>Deine Schicht ist eingetragen</h1>
                                                <p style={styles.paragraph}>Hallo {entry.name},</p>
                                                <p style={styles.paragraph}>
                                                    deine Anmeldung für <strong>{shiftKind.title}</strong> bei <strong>{event.title}</strong> ist gespeichert. Hier sind deine Details:
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.detailsCell}>
                                                <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} border={0} style={styles.detailsTable}>
                                                    <tbody>
                                                        <tr>
                                                            <td style={styles.detailLabel}>Event</td>
                                                            <td style={styles.detailValue}>{event.title}</td>
                                                        </tr>
                                                        {eventDay && (
                                                            <tr>
                                                                <td style={styles.detailLabel}>Tag</td>
                                                                <td style={styles.detailValue}>{eventDay.dayTitle}</td>
                                                            </tr>
                                                        )}
                                                        <tr>
                                                            <td style={styles.detailLabel}>Schicht</td>
                                                            <td style={styles.detailValue}>{shiftKind.title}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>Zeit</td>
                                                            <td style={styles.detailValue}>{dateLine}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>Ort</td>
                                                            <td style={styles.detailValue}>{event.location}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style={styles.detailLabel}>Name</td>
                                                            <td style={styles.detailValue}>{entry.name}</td>
                                                        </tr>
                                                        {entry.notes && (
                                                            <tr>
                                                                <td style={styles.detailLabel}>Notiz</td>
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
                                                    <p style={styles.smallMuted}>Beschreibung der Schicht:</p>
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
                                                                <a href={editUrl} style={styles.button}>Schicht ansehen & bearbeiten</a>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.fallbackCell}>
                                                <p style={styles.smallMuted}>
                                                    Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser:
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
                                                        Der Link meldet dich automatisch an. Solltest du diese Schicht nicht angemeldet haben, kannst du sie über den Link wieder austragen.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p style={styles.footer}>
                                    Gesendet von Menschis · Schichtplanung für Festivals
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

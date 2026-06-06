import type { CSSProperties } from "react";
import type { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";

type EmailTranslator = Awaited<ReturnType<typeof getTranslations<"Emails">>>;

type Props = {
    url: string;
    recipientName?: string;
    locale: Locale;
    t: EmailTranslator;
};

export function MagicLinkEmail({ url, recipientName, locale, t }: Props) {
    const greeting = recipientName
        ? t("magicLink.greeting", { name: recipientName })
        : t("magicLink.greetingPlain");

    return (
        <html lang={locale}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="color-scheme" content="light dark" />
                <title>{t("magicLink.documentTitle")}</title>
            </head>
            <body style={styles.body}>
                <span style={styles.preheader}>
                    {t("magicLink.preheader")}
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
                                                            <td align="right" style={styles.headerTag}>{t("magicLink.tag")}</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.bodyPad}>
                                                <h1 style={styles.h1}>{t("magicLink.heading")}</h1>
                                                <p style={styles.paragraph}>{greeting}</p>
                                                <p style={styles.paragraph}>
                                                    {t("magicLink.body")}
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" style={styles.ctaCell}>
                                                <table role="presentation" cellPadding={0} cellSpacing={0} border={0}>
                                                    <tbody>
                                                        <tr>
                                                            <td align="center" style={styles.buttonWrap}>
                                                                <a href={url} style={styles.button}>{t("magicLink.cta")}</a>
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
                                                    <a href={url} style={styles.fallbackLink}>{url}</a>
                                                </p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style={styles.footerCell}>
                                                <div style={styles.divider}>
                                                    <p style={styles.smallMuted}>
                                                        {t("magicLink.expiry")}
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
    ctaCell: {
        padding: "8px 32px 32px 32px",
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

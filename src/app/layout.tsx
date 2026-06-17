import type { Metadata } from "next";
import { Righteous } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import Providers from "@/components/Providers";
import NavBar from "@/components/Navigation/NavBar";
import Footer from "@/components/Navigation/Footer";
import PendingShiftsPopup from "@/components/Shifts/Entry/PendingShiftsPopup";
import "./globals.css";
import { AppName } from "@/lib/misc/vars";
import Script from "next/script";

const righteous = Righteous({
    weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("Common");
    return {
        title: AppName,
        description: t("description"),
    };
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const UMAMI_WEBSITE_ID = process.env.UMAMI_WEBSITE_ID;

    const UMAMI_URL = process.env.UMAMI_URL;

    return (
        <html lang={locale}>
            <head>
                <title>{AppName}</title>
            {UMAMI_WEBSITE_ID && UMAMI_URL && (
                <Script defer src={UMAMI_URL + "/umami"} data-website-id={UMAMI_WEBSITE_ID}></Script>
            )}
            </head>
            <body className={`${righteous.className} antialiased`}>
                <NextIntlClientProvider>
                    <Providers>
                        <NavBar />
                        <PendingShiftsPopup />
                        {children}
                        <Footer />
                    </Providers>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}

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
    return (
        <html lang={locale}>
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

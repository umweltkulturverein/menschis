import type { Metadata } from "next";
import { Righteous } from "next/font/google";
import Providers from "@/components/Providers";
import NavBar from "@/components/Navigation/NavBar";
import Footer from "@/components/Navigation/Footer";
import PendingShiftsPopup from "@/components/Shifts/Entry/PendingShiftsPopup";
import "./globals.css";
import { AppName } from "@/lib/misc/vars";

const righteous = Righteous({
    weight: "400",
});

export const metadata: Metadata = {
    title: AppName,
    description: "Helfer*innen Planungstool des umweltkulturverein e.V. ",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${righteous.className} antialiased`}>
                <Providers>
                    <NavBar />
                    <PendingShiftsPopup />
                    {children}
                    <Footer />
                </Providers>
            </body>
        </html>
    );
}

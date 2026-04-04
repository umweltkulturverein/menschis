// TODO: wire up a real email provider (nodemailer, Resend, Postmark, etc.)
// Set SMTP_FROM and provider-specific env vars when ready.

export async function sendMagicLink(
    email: string,
    loginToken: string,
    redirectPath?: string,
): Promise<void> {
    const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const url = `${base}/api/auth/magic?token=${loginToken}${redirectPath ? `&redirect=${encodeURIComponent(redirectPath)}` : ""}`;

    // Replace this block with your email provider:
    console.log(`[magic link] To: ${email} — ${url}`);
}

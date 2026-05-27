
type CaptchaResult = { success: boolean, "error-codes"?: string[] }

async function ValidateTurnstile(token: string): Promise<CaptchaResult> {
    if (!process.env.TURNSTILE_SECRET_KEY) {
        return { success: true };
    }
    try {
        const response = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: token,
                }),
            },
        );

        return await response.json();
    } catch (error) {
        console.error("Turnstile validation error:", error);
        return { success: false, "error-codes": ["internal-error"] };
    }
}
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { runMigrations } = await import("./migrate/migrate");
        await runMigrations();
    }
}

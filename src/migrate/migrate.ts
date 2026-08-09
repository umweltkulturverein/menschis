import { Migrator, FileMigrationProvider } from "kysely/migration";
import { readdir } from "fs/promises";
import path from "path";
import { db } from "../db";

export async function runMigrations() {
    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs: { readdir },
            path,
            migrationFolder: path.resolve("src/migrate/migrations"),
        }),
    });

    const { error, results } = await migrator.migrateToLatest();

    for (const result of results ?? []) {
        if (result.status === "Success") {
            console.log(`Migration "${result.migrationName}" applied`);
        } else if (result.status === "Error") {
            console.error(`Migration "${result.migrationName}" failed`);
        }
    }

    if (error) {
        throw error;
    }
}

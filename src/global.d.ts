import type messages from "../messages/de.json";
import type { Locale } from "@/i18n/config";

declare module "next-intl" {
    interface AppConfig {
        Locale: Locale;
        Messages: typeof messages;
    }
}

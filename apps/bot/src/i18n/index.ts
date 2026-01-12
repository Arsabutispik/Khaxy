import i18next from "i18next";
import FsBackend from "i18next-fs-backend/esm";
import { logger } from "@lib";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export async function initI18n() {
  try {
    await i18next.use(FsBackend).init({
      initAsync: false,
      fallbackLng: "en-GB",
      lng: "en-GB",
      preload: ["en-GB", "tr-TR"],
      ns: ["translations", "events", "permissions", "commands", "help", "guild-features", "locales"],
      defaultNS: "translations",
      backend: {
        loadPath: join(__dirname, "../../locales/{{lng}}/{{ns}}.yml"),
      },
      interpolation: { escapeValue: false },
      load: "currentOnly",
    });

    logger.log({
      level: "info",
      message: "i18next has been initialized.",
      discord: false,
    });
  } catch (err) {
    logger.log({
      level: "error",
      message: "Error initializing i18next.",
      error: err,
      discord: false,
    });
  }
}

export default i18next;

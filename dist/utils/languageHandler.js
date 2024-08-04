import fs from 'fs';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const localizationsDir = path.join(__dirname, '../locales');
const languages = {};
async function loadLocalizations(directory) {
    const files = await fs.promises.readdir(directory);
    for (const file of files) {
        const stat = await fs.promises.lstat(path.join(directory, file));
        if (stat.isDirectory())
            await loadLocalizations(path.join(directory, file));
        else {
            if (file.endsWith(".json")) {
                const language = file.split(".")[0];
                const data = await fs.promises.readFile(path.join(directory, file));
                languages[language] = JSON.parse(data.toString());
            }
        }
    }
}
await loadLocalizations(localizationsDir);
function languageHandler(textId, client, guildId) {
    const selectedLanguage = client.guildsConfig.get(guildId)?.config.language || "en-US";
    if (!languages[selectedLanguage] || !languages[selectedLanguage][textId]) {
        throw new Error(`Text with id ${textId} not found in language file for ${selectedLanguage}`);
    }
    if (typeof languages[selectedLanguage][textId] === "string")
        return languages[selectedLanguage][textId];
    return JSON.parse(JSON.stringify(languages[selectedLanguage][textId]));
}
export default languageHandler;
//# sourceMappingURL=languageHandler.js.map
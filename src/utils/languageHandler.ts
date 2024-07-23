import {KhaxyClient} from "../../types";
import fs from 'fs';
import path from 'path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const localizationsDir = path.join(__dirname, '../localisations');
const languages: Record<string, any> = {};

function loadLocalizations(directory: string) {
    const files = fs.readdirSync(directory);
    files.forEach(file => {
        if (file.endsWith('.json')) {
            const filePath = path.join(directory, file);
            const locale = path.basename(file, '.json');
            const content = fs.readFileSync(filePath, 'utf-8');
            try {
                languages[locale] = JSON.parse(content);
            } catch (error) {
                console.error(`Error parsing JSON file ${file}:`, error);
            }
        }
    });
}

// Load localisations
loadLocalizations(localizationsDir);

function languageHandler(textId: string, client: KhaxyClient, guildId: string) {
    const selectedLanguage = client.guildsConfig.get(guildId)?.config.language || "en-US";

    if (!languages[selectedLanguage] || !languages[selectedLanguage][textId]) {
        throw new Error(`Text with id ${textId} not found in language file for ${selectedLanguage}`);
    }

    return languages[selectedLanguage][textId];
}

export default languageHandler;
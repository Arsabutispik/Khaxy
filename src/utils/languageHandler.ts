import {KhaxyClient} from "../../@types/types";
import fs from 'fs';
import path from 'path';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const localizationsDir = path.join(__dirname, '../locales');
const languages: Record<string, any> = {};

function loadLocalizations(directory: string) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (fs.lstatSync(path.join(directory, file)).isDirectory()) {
            loadLocalizations(path.join(directory, file));
        } else {
            languages[file.replace('.json', '')] = import(path.join(directory, file)).then((res) => res.default);
        }
    }
}

// Load localisations
loadLocalizations(localizationsDir);

function languageHandler(textId: string, client: KhaxyClient, guildId: string) {
    const selectedLanguage = client.guildsConfig.get(guildId)?.config.language || "en-US";

    if (!languages[selectedLanguage] || !languages[selectedLanguage][textId]) {
        throw new Error(`Text with id ${textId} not found in language file for ${selectedLanguage}`);
    }
    if(typeof languages[selectedLanguage][textId] === "string") return languages[selectedLanguage][textId];
    return JSON.parse(JSON.stringify(languages[selectedLanguage][textId]));
}

export default languageHandler;
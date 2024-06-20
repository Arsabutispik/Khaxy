import {HolyClient} from "../types";
import languages from "../lang.json" assert {type: 'json'};
function languageHandler(textId: keyof typeof languages.translations, client: HolyClient, guildId: string) {
    if (!languages.translations[textId]) {
        throw new Error(`Text with id ${textId} not found in language file`);
    }
    const selectedLanguage = client.guildsConfig.get(guildId)?.config.language || "english";

    return languages.translations[textId][selectedLanguage];
}

export default languageHandler;
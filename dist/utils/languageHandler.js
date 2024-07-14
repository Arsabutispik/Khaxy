import languages from "../lang.json" assert { type: 'json' };
function languageHandler(textId, client, guildId) {
    if (!languages.translations[textId]) {
        throw new Error(`Text with id ${textId} not found in language file`);
    }
    const selectedLanguage = client.guildsConfig.get(guildId)?.config.language || "english";
    return languages.translations[textId][selectedLanguage];
}
export default languageHandler;
//# sourceMappingURL=languageHandler.js.map
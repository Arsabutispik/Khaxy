import {
    ChatInputCommandInteraction,
    Client,
    Collection,
    Message,
    SlashCommandBuilder, Snowflake
} from "discord.js";
import { UpdateQuery } from "mongoose";
import botconfig from "../src/botconfig.js";

export type ExecuteParameters = {
    client: KhaxyClient;
    message: Message;
    args: string[];
}
export interface commandBase {
    name: string
    aliases?: string[]
    category: string
    description: string
    usage: string
    examples: string
    execute(p: ExecuteParameters): any
}

export interface helpBase {
    name: string
    description: string
    usage: string
    examples: string[]
    category: string
    hidden?: boolean
}
export interface slashCommandBase {
    data: SlashCommandBuilder
    ownerOnly?: boolean
    execute(p: slashExecuteParameters): any
    help: helpBase
}
export interface slashExecuteParameters {
    client: KhaxyClient;
    interaction: ChatInputCommandInteraction
}
export interface guildConfig {
    case: number,
    config: {
        welcomeChannel: string,
        welcomeMessage: string,
        registerWelcomeChannel: string,
        leaveChannel: string,
        leaveMessage: string,
        registerChannel: string,
        registerMessage: string,
        registerChannelClear: boolean,
        registerMessageClear: boolean,
        muteGetAllRoles: boolean,
        modlogChannel: string,
        muteRole: string,
        maleRole: string,
        femaleRole: string,
        memberRole: string,
        staffRole: Array<string>,
        djRole: string,
        roleOfTheDay: string,
        colorName: string,
        modmail: {
            category: string,
            logChannel: string,
            tickets: number,
            newThreadMessage: string
            snippets: Array<{name: string, message: string}>
        },
        language: "tr" | "en-US",
        bumpLeaderboardChannel: string
    }
}
export declare class KhaxyClient extends Client {

    public commands: Collection<string, commandBase>;

    public categories: Collection<string, string[]>;

    public config: typeof botconfig

    public slashCommands: Collection<string, slashCommandBase>

    public guildsConfig: Collection<string, guildConfig>

    public updateGuildConfig(p: updateGuildConfigParameters): Promise<void>

    public handleLanguages<K extends keyof typeof import("../src/locales/en-US/en-US.json") | keyof typeof import("../src/locales/tr/tr.json")>(textId: K, client: KhaxyClient, guildId: Snowflake): typeof import("../src/locales/en-US/en-US.json")[K] | typeof import("../src/locales/tr/tr.json")[K]
}

export interface customObject {
    [key: string]: string
}

export interface updateGuildConfigParameters {
    guildId: Snowflake,
    config: UpdateQuery<any>
}
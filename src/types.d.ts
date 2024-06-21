import {
    ChatInputCommandInteraction,
    Client,
    Collection,
    Message,
    SlashCommandBuilder, Snowflake
} from "discord.js";
import { UpdateQuery } from "mongoose";
export type ExecuteParameters = {
    client: HolyClient;
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
    client: HolyClient;
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
        }
        language: "turkish" | "english"
    }
}
export declare class HolyClient extends Client {

    public commands: Collection<string, commandBase>;

    public categories: Collection<string, string[]>;

    public config: any

    public slashCommands: Collection<string, slashCommandBase>

    public guildsConfig: Collection<string, guildConfig>

    public updateGuildConfig(p: updateGuildConfigParameters): Promise<void>

    public userTickets : Collection<string, string>

    public ticketMessages : Collection<string, string>

    public handleLanguages(textId: keyof typeof import("./lang.json").translations, client: HolyClient, guildId: Snowflake): string | any
}

export interface customObject {
    [key: string]: string
}

export interface updateGuildConfigParameters {
    guildId: Snowflake,
    config: UpdateQuery<any>
}
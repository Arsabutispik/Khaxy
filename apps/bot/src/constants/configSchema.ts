export const CONFIG_SCHEMA = {
  logConfig: [
    "messageLogsChannelId",
    "modLogsChannelId",
    "guildLogsChannelId",
    "guildMemberLogsChannelId",
    "voiceLogsChannelId",
    "channelLogsChannelId",
    "emojiLogsChannelId",
    "roleLogsChannelId",
    "stickerLogsChannelId",
    "eventLogsChannelId",
    "inviteLogsChannelId",
    "pollLogsChannelId",
    "stageLogsChannelId",
    "soundboardLogsChannelId",
    "threadLogsChannelId",
    "webhookLogsChannelId",
  ],
  registerConfig: ["registerJoinChannelId", "registerChannelId", "registerJoinMessage"],
  welcomeConfig: ["joinChannelId", "leaveChannelId", "joinMessage", "leaveMessage"],
  root: [
    "modMailChannelId",
    "modMailMessage",
    "djRoleId",
    "staffRoleId",
    "memberRoleId",
    "unverifiedRoleId",
    "maleRoleId",
    "femaleRoleId",
    "muteRoleId",
    "colourIdOfTheDay",
  ],
} as const;

export type RelationName = keyof typeof CONFIG_SCHEMA;

export type LogKey = (typeof CONFIG_SCHEMA.logConfig)[number];
export type RegisterKey = (typeof CONFIG_SCHEMA.registerConfig)[number];
export type WelcomeKey = (typeof CONFIG_SCHEMA.welcomeConfig)[number];
export type RootKey = (typeof CONFIG_SCHEMA.root)[number];

export type DbConfigKey = LogKey | RegisterKey | WelcomeKey | RootKey;

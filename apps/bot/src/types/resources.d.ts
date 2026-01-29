interface Resources {
  "commands": {
    "ban": {
      "cantBanBot": "You can't ban a bot.",
      "cantBanHigher": "You can't ban a user with a higher role than you.",
      "cantBanMod": "You can't ban a moderator.",
      "cantBanSelf": "You can't ban yourself.",
      "databaseError": "Critical error while updating the database. The developers have been notified. The command has been cancelled.",
      "errors": {
        "banFailed": "Failed to ban {{user}}. Ensure my role is higher than the user's role and I have ban permissions."
      },
      "message": {
        "dm": {
          "duration": "You have been banned from **{{guild}}** for **{{duration}}**. Reason:```{{reason}}```",
          "permanent": "You have been permanently banned from **{{guild}}**. Reason:```{{reason}}```"
        },
        "fail": {
          "duration": "{{confirm}} **{{user}}** has been banned for **{{duration}}** (Case #{{case}}). The user could not be notified via DM.",
          "permanent": "{{confirm}} **{{user}}** has been permanently banned (Case #{{case}}). The user could not be notified via DM."
        },
        "success": {
          "duration": "{{confirm}} **{{user}}** has been banned for **{{duration}}** (Case #{{case}}). The user has been notified via DM.",
          "durationNoMember": "{{confirm}} **{{user}}** has been banned for **{{duration}}** (Case #{{case}}).",
          "permanent": "{{confirm}} **{{user}}** has been permanently banned (Case #{{case}}). The user has been notified via DM.",
          "permanentNoMember": "{{confirm}} **{{user}}** has been permanently banned (Case #{{case}})."
        }
      },
      "noReason": "No reason provided."
    },
    "close": {
      "accept": "Override",
      "close": "Thread is being closed...",
      "closeDuration": "Thread will be closed in **{{duration}}**.",
      "error": "Error while closing the thread.",
      "noDuration": "A duration has not been provided.",
      "noThread": "This is not a mod mail thread.",
      "reject": "Cancel",
      "threadCloseDate": "Thread is scheduled to be closed on **{{date}}**. Would you like to override this?",
      "threadCloseDateAccepted": "Continuing override...",
      "threadCloseDateRejected": "Thread will be closed on **{{date}}**.",
      "threadClosedDm": "Your thread in {{guild}} has been closed.",
      "timeout": "Timed out. The thread will be closed on **{{date}}**."
    },
    "closeCancel": {
      "cancelled": "The closing of this mod mail thread has been cancelled.",
      "error": "An error occurred while cancelling the close. Developers have been notified.",
      "noThread": "This is not a mod mail thread.",
      "notClosing": "This mod mail thread is not marked for close."
    },
    "config": {
      "embed": {
        "log": {
          "fields": {
            "guildLogsChannel": "Guild Logs Channel",
            "messageLogsChannel": "Message Logs Channel"
          },
          "title": "Log Settings"
        },
        "misc": {
          "fields": {
            "language": "Language",
            "modMailMessage": "Mod Mail Message"
          },
          "title": "Miscellaneous Settings"
        },
        "moderation": {
          "fields": {
            "modLogChannel": "Moderation Log Channel",
            "muteGetAllRoles": "Mute Get All Roles",
            "registerDayLimit": "Register Day Limit",
            "staffRole": "Staff Role"
          },
          "title": "Moderation Settings"
        },
        "register": {
          "fields": {
            "registerChannel": "Register Channel",
            "registerChannelClear": "Clear Register Channel",
            "registerJoinChannel": "Register Join Channel",
            "registerJoinMessage": "Register Join Message"
          },
          "title": "Register Settings"
        },
        "role": {
          "fields": {
            "colorOfTheDay": "Colour of the Day"
          },
          "title": "Role Settings"
        },
        "welcomeLeave": {
          "fields": {
            "leaveChannel": "Leave Channel",
            "leaveMessage": "Leave Message",
            "welcomeChannel": "Welcome Channel",
            "welcomeMessage": "Welcome Message"
          },
          "title": "Welcome/Leave Settings"
        }
      },
      "noSetting": "Use the menu below to navigate the settings. Each title can be clicked to view the documentation.",
      "none": "N/A",
      "selectMenu": {
        "log": "Log Settings",
        "misc": "Miscellaneous Settings",
        "moderation": "Moderation Settings",
        "register": "Register Settings",
        "role": "Role Settings",
        "welcomeLeave": "Welcome/Leave Settings"
      }
    },
    "infractionPunishments": {
      "banSet": "User will be banned at {{threshold}} infractions.",
      "durationMissing": "You must provide a duration for temporary punishments.",
      "kickSet": "User will be kicked at {{threshold}} infractions.",
      "muteSet": "{{duration}} of mute will be given at {{threshold}} infractions.",
      "noConfig": "No infraction punishments configured for {{threshold}} infractions.",
      "noMuteRole": "Mute role not found. Please set a mute role in the config.",
      "removed": "Punishment for {{type}} at {{threshold}} infractions has been removed.",
      "tempbanSet": "{{duration}} ban will be given at {{threshold}} infractions."
    },
    "infractions": {
      "case": {
        "embed": {
          "description": "> **Infraction Type:** {{type}}\n> **Moderator:** {{moderator}}\n> **Reason:** {{reason}}\n> **Date:** {{date}}",
          "title": "Infraction Case #{{case}}"
        },
        "noInfraction": "No infraction found with case ID #{{case}}."
      },
      "noReason": "No reason provided",
      "noUser": "User not found.",
      "user": {
        "embed": {
          "fields": {
            "title": "Case #{{case}}",
            "value": "> **Infraction Type:** {{type}}\n> **Moderator:** {{moderator}}\n> **Reason:** {{reason}}\n> **Date:** {{date}}"
          },
          "title": "Infractions for {{user}}"
        },
        "noInfraction": "**{{user}}** has no infractions.",
        "pageFooter": "Page {{current}} of {{total}}"
      }
    },
    "kick": {
      "cantKick": "Can't kick this member.",
      "cantKickBot": "You can't kick a bot.",
      "cantKickHigher": "You can't kick a user with a higher role than you.",
      "cantKickMod": "You can't kick a moderator.",
      "cantKickSelf": "You can't kick yourself.",
      "clearFail": "Failed to clear the messages.",
      "embed": {
        "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Joined At**: {{timestamp}}",
        "fields": {
          "reason": "Reason"
        },
        "title": "User Kicked"
      },
      "fail": "Failed to kick the member.",
      "joinDateUnknown": "Unknown",
      "message": {
        "dm": "You have been kicked from **{{guild}}**. Reason:```{{reason}}```",
        "fail": "{{confirm}} **{{user}}** has been kicked (Case #{{case}}). The user could not be notified via DM.",
        "success": "{{confirm}} **{{user}}** has been kicked (Case #{{case}}). The user has been notified via DM."
      },
      "noMember": "Member not found in the server.",
      "noReason": "No reason provided for kicking."
    },
    "modmailBlacklist": {
      "blacklistError": "An error occurred while blacklisting the user. Developers have been notified.",
      "blacklistGet": {
        "embed": {
          "fields": {
            "createdAt": "Blacklisted At",
            "expiresAt": "Expires At",
            "moderator": "Responsible Moderator",
            "reason": "Reason"
          },
          "title": "Blacklist Entry for {{user}}"
        },
        "notFound": "Blacklist entry for {{user}} not found. This means the user is not blacklisted."
      },
      "blacklistRemove": {
        "error": "An error occurred while removing the user from the blacklist. Developers have been notified.",
        "notFound": "Blacklist entry for {{user}} not found. This means the user is not blacklisted.",
        "success": "{{confirm}} {{user}} has been removed from the blacklist."
      },
      "blacklistSuccess": "{{confirm}} **{{user}}** has been blacklisted for **{{duration}}** with reason: ```{{reason}}```",
      "cannotBlacklistBot": "You cannot blacklist a bot.",
      "cannotBlacklistSelf": "You cannot blacklist yourself.",
      "durationWithoutTime": "You must provide a time unit for the duration.",
      "noReason": "No reason provided for blacklisting.",
      "permanentBlacklistWarning": "Permanent blacklisting isn't allowed. Please provide a duration.",
      "timeWithoutDuration": "You must provide a duration for the time unit."
    },
    "modmailLogs": {
      "logSent": "Mod mail logs for user {{user}}.",
      "noMessagesFound": "No messages found for thread ID #{{logId}}.",
      "noThreadFound": "No thread found for ID #{{logId}}.",
      "threadNotClosed": "Thread #{{logId}} is not closed.",
      "userNotFound": "No user found for ID {{userId}}."
    },
    "mute": {
      "alreadyMuted": "User is already muted.",
      "alreadyMutedNoPunishment": "A punishment was not found, but the user is already muted. If they appear to be, please unmute them manually.",
      "cantMuteBot": "You can't mute a bot.",
      "cantMuteHigher": "You can't mute a user with a higher role than you.",
      "cantMuteMod": "You can't mute a moderator.",
      "cantMuteYourself": "You can't mute yourself.",
      "databaseError": "Critical error while updating the database. The developers have been notified. The command has been cancelled.",
      "embed": {
        "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Roles Added**: {{added_roles}}",
        "removed": "Roles Removed",
        "title": "User Roles Changed"
      },
      "message": {
        "dm": "You have been muted in **{{guild}}** for **{{duration}}**. Reason:```{{reason}}```",
        "fail": "{{confirm}} **{{user}}** has been muted for **{{duration}}** (Case #{{case}}). The user could not be notified via DM.",
        "success": "{{confirm}} **{{user}}** has been muted for **{{duration}}** (Case #{{case}}). The user has been notified via DM."
      },
      "noMember": "Member not found. Is the member still in the server?",
      "noMuteRole": "Mute role not found.",
      "noReason": "No reason provided for muting.",
      "notMuted": "A punishment was found, but the user is not muted. Adding the role.",
      "roleError": "Error while removing or adding roles. I may not have permission to do so. Please check the role permissions. The command has been cancelled."
    },
    "newthread": {
      "channelCreateFailed": "Failed to create mod mail thread. Please ensure I have the correct permissions.",
      "createdBy": "Thread created by {{user}}",
      "databaseError": "Critical error while updating the database. The developers have been notified. The command has been cancelled.",
      "dmFailed": "Failed to send DM to the user. They may have DMs disabled or blocked me.",
      "initial": "`Account Age:` **{{account_age}}**, `ID:` **{{user.id}}**\n`Username:` **{{user.username}}** (<@{{user.id}}>), `Join Date:` **{{join_date}}**\n**»»----------------------------¤----------------------------««**",
      "message": "A thread with the `{{guild}}` has been created. **[{{user}}]:** {{message}}",
      "messageSendFailed": "Failed to send message in the mod mail thread. Thread is dropped.",
      "modMailChannelNotInParent": "The mod mail channel is not in a category. Please set up a valid mod mail channel in the config.",
      "modMailChannelNotText": "The mod mail channel is not a text channel. Please set up a valid mod mail channel in the config.",
      "noModMailChannel": "Mod mail channel not found. Please set up a mod mail channel in the config.",
      "threadCreated": "Mod mail thread created successfully.",
      "threadExists": "User already has an open mod mail thread.",
      "topic": "Mod Mail conversation with {{user}}",
      "userNotInGuild": "User not found in the guild."
    },
    "purge": {
      "any": {
        "error": "An error occurred while deleting the messages. Please try again later.",
        "success": "{{confirm}} Successfully deleted **{{count}}** messages."
      },
      "bots": {
        "error": "An error occurred while deleting the bot messages. Please try again later.",
        "success": "{{confirm}} Successfully deleted **{{count}}** messages from bots."
      },
      "notTextChannel": "This command can only be used in text channels.",
      "user": {
        "error": "An error occurred while deleting the messages from the user. Please try again later.",
        "success": "{{confirm}} Successfully deleted **{{count}}** messages from **{{user}}**."
      }
    },
    "register": {
      "alreadyRegistered": "This user is already registered.",
      "error": "Error while registering the user. {{error}}",
      "noFemaleRole": "Female role not found. Please set up a female role in the config.",
      "noMaleRole": "Male role not found. Please set up a male role in the config.",
      "noMember": "Member not found. Is the member still in the server?",
      "noMemberRole": "Member role not found. Please set up a member role in the config.",
      "noRegisterChannel": "Register channel not found. Please set up a register channel in the config.",
      "notValid": "Not a valid choice. Please choose either 'male' or 'female'.",
      "success": "{{confirm}} **{{user}}** has been registered.",
      "wrongChannel": "This command can only be used in the register channel."
    },
    "reply": {
      "anonymous": "Anonymous",
      "dmFailed": "Failed to send DM to the user. They may have DMs disabled or blocked me.",
      "error": "An error occurred while accessing the database.",
      "memberNotFound": "Member not found. Is the member still in the server?",
      "noMessages": "No messages found in the thread to use as a quote.",
      "noRole": "No Role",
      "noThread": "This is not a mod mail thread.",
      "success": "Message has been sent to the user.",
      "suspended": "This mod mail thread has been suspended. Unsuspend the thread to reply."
    },
    "roles": {
      "roleAddError": "Error while adding the role. I may not have permission to do so.",
      "roleAdded": "{{user}} has been given the role **{{role}}**.",
      "roleAlreadyAssigned": "{{user}} already has the role **{{role}}**.",
      "roleNotAssigned": "{{user}} does not have the role **{{role}}**.",
      "roleRemoveError": "Error while removing the role. I may not have permission to do so.",
      "roleRemoved": "**{{role}}** has been removed from {{user}}.",
      "userNotFound": "Member not found. Is the member still in the server?"
    },
    "support": {
      "embed": {
        "fields": {
          "docsSite": "Documentation Site",
          "supportServer": "Support Server"
        },
        "title": "Support Links"
      },
      "error": "An error occurred while creating the invite. Please try again later.",
      "guildNotFound": "Dev Guild not found cannot create invite."
    },
    "suspend": {
      "alreadySuspended": "This mod mail thread is already suspended.",
      "error": "An error occurred while suspending the thread. Developers have been notified.",
      "noThread": "This is not a mod mail thread.",
      "suspended": "This mod mail thread has been suspended. You can no longer reply to the user."
    },
    "unban": {
      "error": "Error while unbanning the user. {{error}}",
      "noReason": "No reason provided for unbanning.",
      "noUser": "User not found.",
      "notBanned": "{{user}} is not banned.",
      "success": "{{confirm}} **{{user}}** has been unbanned (Case #{{case}})."
    },
    "unmute": {
      "databaseError": "Critical error while updating the database. The developers have been notified. The command has been cancelled.",
      "dm": "You have been unmuted in **{{guild}}**.",
      "dmError": "{{confirm}} **{{user}}** has been unmuted (Case #{{case}}). The user could not be notified via DM.",
      "mutedNoPunishment": "A punishment was not found, but the user is muted. If they appear to be, please unmute them manually.",
      "noMember": "Member not found. Is the member still in the server?",
      "noMuteRole": "Mute role not found. Please update the mute role in the settings.",
      "noReason": "No reason provided for unmuting.",
      "notMuted": "User is not muted. If they appear to be, please remove the role manually. Lost roles cannot be restored automatically.",
      "previousRoleError": "Error while restoring previous roles. I may not have permission to add the roles. The command has been cancelled.",
      "roleError": "Error while removing the role. The role may have been deleted or I may not have permission to remove it.",
      "success": "{{confirm}} **{{user}}** has been unmuted (Case #{{case}}). The user has been notified via DM."
    },
    "unsuspend": {
      "error": "An error occurred while unsuspending the thread. Developers have been notified.",
      "noThread": "This is not a mod mail thread.",
      "notSuspended": "This mod mail thread is not suspended.",
      "unsuspended": "This mod mail thread has been unsuspended. You can now reply to the user.",
      "userHasOpenThreads": "User has a open thread. You can't unsuspend this thread."
    },
    "warn": {
      "botWarn": "You can't warn a bot.",
      "databaseError": "Critical error while updating the database. The developers have been notified. The command has been cancelled.",
      "dm": "You have been warned in **{{guild}}**. Reason:```{{reason}}```",
      "dmError": "{{confirm}} **{{user}}** has been warned (Case #{{case}}). The user could not be notified via DM.",
      "noMember": "Member not found. Is the member still in the server?",
      "selfWarn": "You can't warn yourself.",
      "staffWarn": "You can't warn a staff member.",
      "success": "{{confirm}} **{{user}}** has been warned (Case #{{case}}). The user has been notified via DM."
    }
  },
  "components": {
    "config": {
      "joinChannelId": {
        "modal": {
          "description": "Configure the message sent to the Join Channel when a new user joins the server.",
          "label": {
            "joinMessage": "Join Message",
            "placeholders": "Placeholders"
          },
          "title": "Set Join Message"
        },
        "test": {
          "fail": "{{reject}} Could not send message.\n- Check if the channel is set.\n- Check if the bot has **Send Messages** permission in that channel.",
          "pass": "{{check}} Test message sent to <#{{channelId}}>!"
        }
      },
      "modMailMessage": {
        "modal": {
          "description": "Set up the message that will be sent to users when they open a mod mail ticket.",
          "label": {
            "messageContent": "Message Content",
            "placeholders": "Placeholders"
          },
          "placeholder": {
            "messageContent": "Enter the message content here..."
          },
          "title": "Edit Mod Mail Message"
        }
      }
    }
  },
  "events": {
    "channelDelete": {
      "channelTypes": {
        "0": "Text Channel",
        "1": "DM Channel",
        "10": "News Thread Channel",
        "11": "Public Thread Channel",
        "12": "Private Thread Channel",
        "13": "Stage Channel",
        "14": "Directory Channel",
        "15": "Forum Channel",
        "16": "Media Channel",
        "2": "Voice Channel",
        "3": "Group DM Channel",
        "4": "Category Channel",
        "5": "News Channel"
      },
      "embed": {
        "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Type**: {{channel_type}}\n> **Deleted At**: {{timestamp}}",
        "title": "Channel Deleted"
      },
      "unknownExecutor": "Unknown Executor"
    },
    "guildBanAdd": {
      "noReason": "No reason provided."
    },
    "guildBanRemove": {
      "noReason": "No reason provided."
    },
    "guildMemberAdd": {
      "embed": {
        "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Account Age**: {{timestamp}}\n> **Member Count**: {{member_count}}",
        "title": "User Joined Server"
      }
    },
    "guildMemberRemove": {
      "noReason": "No reason provided.",
      "userLeft": "**User has left {{guild}}**"
    },
    "interactionCreate": {
      "botMissingPermissions": "I don't have the required `{{permissions}}` permissions to execute this command.",
      "memberMissingPermissions": "You don't have the required `{{permissions}}` permissions to use this command."
    },
    "messageCreate": {
      "modMail": {
        "blacklisted": "You are blacklisted from using mod mail in {{guild}}. Your blacklist reason is: **{{reason}}**. Your blacklist expires on: **{{expires}}**.",
        "cancel": "No",
        "cancelledTitle": "Mod Mail Thread Cancelled",
        "confirm": "Yes",
        "confirmDescription": "Click the button below to confirm the mod mail thread for {{guild}}, or click the cancel button to cancel the thread.",
        "confirmTitle": "Confirm Mod Mail Thread Button",
        "errorInserting": "An error occurred while attempting to insert the message into the database.",
        "initial": "`Account Age:` **{{account_age}}**, `ID:` **{{user.id}}**\n`Username:` **{{user.username}}** (<@{{user.id}}>), `Join Date:` **{{join_date}}**\n**»»----------------------------¤----------------------------««**",
        "never": "Never",
        "notMember": "You are not a member of the server.",
        "parentChannelMissing": "Parent channel is missing. Moderators need to set the parent channel for the mod mail to work.",
        "reopened": "{{user}} replied to modmail thread, thread won't be closed. ({{closer}})",
        "timeout": "You took too long to respond. The mod mail thread has been cancelled.",
        "topic": "Mod Mail conversation with {{user}}"
      }
    },
    "messageUpdate": {
      "messageEdit": "***User edited their message.***\n```diff\n- {{oldContent}}\n+ {{newContent}}\n```",
      "noContent": "No Content"
    }
  },
  "guild-features": {
    "ANIMATED_BANNER": "Animated Banner",
    "ANIMATED_ICON": "Animated Icon",
    "APPLICATION_COMMAND_PERMISSIONS_V2": "Legacy Command Permissions",
    "AUTO_MODERATION": "Auto Moderation",
    "BANNER": "Banner",
    "COMMUNITY": "Community",
    "CREATOR_MONETIZABLE_PROVISIONAL": "Monetization (Provisional)",
    "CREATOR_STORE_PAGE": "Role Subscription Promo Page",
    "DEVELOPER_SUPPORT_SERVER": "Developer Support Server",
    "DISCOVERABLE": "Discoverable",
    "ENHANCED_ROLE_COLORS": "Enhanced Role Colors",
    "FEATURABLE": "Featurable",
    "GUESTS_ENABLED": "Guests Enabled",
    "GUILD_TAGS": "Guild Tags",
    "HAS_DIRECTORY_ENTRY": "Directory Entry",
    "HUB": "Student Hub",
    "INVITES_DISABLED": "Invites Disabled",
    "INVITE_SPLASH": "Invite Splash",
    "LINKED_TO_HUB": "Linked to Student Hub",
    "MEMBER_VERIFICATION_GATE_ENABLED": "Membership Screening",
    "MONETIZATION_ENABLED": "Monetization",
    "MORE_SOUNDBOARD": "More Soundboard Slots",
    "MORE_STICKERS": "More Sticker Slots",
    "NEWS": "News Channels",
    "PARTNERED": "Partnered",
    "PIN_PERMISSION_MIGRATION_COMPLETE": "Pin Permission Migration Complete",
    "PREVIEW_ENABLED": "Preview Enabled",
    "PRIVATE_THREADS": "Private Threads",
    "RAID_ALERTS_DISABLED": "Raid Alerts Disabled",
    "RELAY_ENABLED": "Relay Enabled",
    "ROLE_ICONS": "Role Icons",
    "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE": "Role Subscriptions Available",
    "ROLE_SUBSCRIPTIONS_ENABLED": "Role Subscriptions Enabled",
    "SOUNDBOARD": "Soundboard",
    "TICKETED_EVENTS_ENABLED": "Ticketed Events",
    "VANITY_URL": "Vanity URL",
    "VERIFIED": "Verified",
    "VIP_REGIONS": "VIP Regions",
    "WELCOME_SCREEN_ENABLED": "Welcome Screen"
  },
  "locales": {
    "bg": "Bulgarian",
    "cs": "Czech",
    "da": "Danish",
    "de": "German",
    "el": "Greek",
    "en-GB": "English (UK)",
    "en-US": "English (US)",
    "es-419": "Spanish (LATAM)",
    "es-ES": "Spanish (Spain)",
    "fi": "Finnish",
    "fr": "French",
    "hi": "Hindi",
    "hr": "Croatian",
    "hu": "Hungarian",
    "id": "Indonesian",
    "it": "Italian",
    "ja": "Japanese",
    "ko": "Korean",
    "lt": "Lithuanian",
    "nl": "Dutch",
    "no": "Norwegian",
    "pl": "Polish",
    "pt-BR": "Portuguese (Brazil)",
    "ro": "Romanian",
    "ru": "Russian",
    "sv-SE": "Swedish",
    "th": "Thai",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "vi": "Vietnamese",
    "zh-CN": "Chinese (Simplified)",
    "zh-TW": "Chinese (Traditional)"
  },
  "loggers": {
    "channelEvents": {
      "channelCreate": {
        "embed": {
          "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Type**: {{channel_type}}\n> **Created At**: {{timestamp}}",
          "title": "Channel Created"
        }
      },
      "channelTypes": {
        "0": "Text Channel",
        "1": "DM Channel",
        "10": "News Thread Channel",
        "11": "Public Thread Channel",
        "12": "Private Thread Channel",
        "13": "Stage Channel",
        "14": "Directory Channel",
        "15": "Forum Channel",
        "16": "Media Channel",
        "2": "Voice Channel",
        "3": "Group DM Channel",
        "4": "Category Channel",
        "5": "News Channel"
      },
      "channelUpdate": {
        "bitrateChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Bitrate**: {{old_bitrate}}\n> **New Bitrate**: {{new_bitrate}}",
            "title": "Voice Channel Bitrate Changed"
          }
        },
        "defaultArchiveDurationChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Default Archive Duration**: {{old_archive_duration}}\n> **New Default Archive Duration**: {{new_archive_duration}}",
            "title": "Forum Channel Default Archive Duration Changed"
          },
          "time": {
            "10080": "1 Week",
            "1440": "1 Day",
            "4320": "3 Days",
            "60": "1 Hour"
          }
        },
        "forumAvailableTagsChange": {
          "added": {
            "embed": {
              "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Name**: {{tag_name}}\n> **Moderation Only**: {{tag_moderation_only}}\n> **Emoji**: {{tag_emoji}}",
              "title": "Forum Channel Available Tags Added"
            }
          },
          "removed": {
            "embed": {
              "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}  \n> **Name**: {{tag_name}}\n> **Moderation Only**: {{tag_moderation_only}}\n> **Emoji**: {{tag_emoji}}",
              "title": "Forum Channel Available Tags Removed"
            }
          },
          "updated": {
            "embed": {
              "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Name**: ~~{{old_tag_name}}~~ -> {{new_tag_name}}\n> **Moderation Only**: ~~{{old_tag_moderation_only}}~~ -> {{new_tag_moderation_only}}\n> **Emoji**: ~~{{old_tag_emoji}}~~ -> {{new_tag_emoji}}",
              "title": "Forum Channel Available Tags Updated"
            }
          }
        },
        "forumDefaultForumLayoutChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Default Forum Layout**: {{old_layout}}\n> **New Default Forum Layout**: {{new_layout}},",
            "title": "Forum Channel Default Forum Layout Changed"
          },
          "layouts": {
            "0": "Not Set",
            "1": "List View",
            "2": "Gallery View"
          }
        },
        "forumDefaultReactionEmojiChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Reaction Emoji**: {{old_reaction_emoji}}\n> **New Reaction Emoji**: {{new_reaction_emoji}}",
            "title": "Forum Channel Default Reaction Emoji Changed"
          }
        },
        "forumDefaultSortOrderChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Sort Order**: {{old_sort_order}}\n> **New Sort Order**: {{new_sort_order}}",
            "title": "Forum Default Sort Order Changed"
          },
          "modes": {
            "0": "Latest Activity",
            "1": "Creation Date"
          }
        },
        "forumDefaultThreadRateLimitChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Rate Limit**: {{old_rate_limit}}\n> **New Rate Limit**: {{new_rate_limit}}",
            "title": "Forum Channel Default Thread Rate Limit Changed"
          }
        },
        "forumRateLimitChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Rate Limit**: {{old_rate_limit}}\n> **New Rate Limit**: {{new_rate_limit}}",
            "title": "Forum Channel Rate Limit Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Channel Name Changed"
          }
        },
        "nsfwChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Status**: {{old_nsfw}}\n> **New Status**: {{new_nsfw}}",
            "title": "Channel NSFW Status Changed"
          }
        },
        "permissionsChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Changes**: {{changes}}",
            "title": "Channel Permission Overwrites Changed"
          },
          "noChanges": "No permission changes detected."
        },
        "rateLimitChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Rate Limit**: {{old_rate_limit}}\n> **New Rate Limit**: {{new_rate_limit}}",
            "title": "Channel Rate Limit Changed"
          }
        },
        "rtcRegionChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old RTC Region**: {{old_rtc_region}}\n> **New RTC Region**: {{new_rtc_region}}",
            "title": "Voice Channel RTC Region Changed"
          }
        },
        "topicChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Topic**: {{old_topic}}\n> **New Topic**: {{new_topic}}",
            "title": "Channel Topic Changed"
          },
          "noTopic": "No Topic"
        },
        "typeChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Type**: {{old_type}}\n> **New Type**: {{new_type}}",
            "title": "Channel Type Changed"
          }
        },
        "userLimitChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old User Limit**: {{old_user_limit}} users\n> **New User Limit**: {{new_user_limit}} users",
            "title": "Channel User Limit Changed"
          }
        },
        "videoQualityModeChange": {
          "embed": {
            "description": "> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **ID**: {{channel.id}}\n> **Old Video Quality Mode**: {{old_video_quality_mode}}\n> **New Video Quality Mode**: {{new_video_quality_mode}}",
            "title": "Voice Channel Video Quality Mode Changed"
          },
          "modes": {
            "1": "Auto",
            "2": "Full (720p)"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "emojiEvents": {
      "emojiCreate": {
        "embed": {
          "description": "> **Emoji**: {{emoji.name}}\n> **ID**: {{emoji.id}}\n> **Animated**: {{emoji_animated}}\n> **Created At**: {{timestamp}}",
          "title": "Emoji Created"
        }
      },
      "emojiDelete": {
        "embed": {
          "description": "> **Emoji**: {{emoji.name}}\n> **ID**: {{emoji.id}}\n> **Animated**: {{emoji_animated}}\n> **Deleted At**: {{timestamp}}",
          "title": "Emoji Deleted"
        }
      },
      "emojiUpdate": {
        "nameChange": {
          "embed": {
            "description": "> **ID**: {{emoji.id}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Emoji Name Changed"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "guildAuditLogEvents": {
      "guildAuditLogEntryCreate": {
        "webhookCreate": {
          "embed": {
            "description": "> **Name**: {{webhook.name}}\n> **ID**: {{webhook.id}}\n> **Channel**: {{channel.name}} (<#{{channel.id}}>)",
            "title": "Webhook Created"
          }
        },
        "webhookDelete": {
          "embed": {
            "description": "> **Name**: {{webhook.name}}\n> **ID**: {{webhook.id}}\n> **Channel**: {{channel.name}} (<#{{channel.id}}>)",
            "title": "Webhook Deleted"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "guildBanEvents": {
      "banAdd": {
        "embed": {
          "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n>",
          "fields": {
            "reason": "Reason"
          },
          "title": "User Banned"
        }
      },
      "banRemove": {
        "embed": {
          "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}",
          "fields": {
            "reason": "Reason"
          },
          "title": "User Unbanned From Server"
        }
      },
      "noReason": "No reason provided",
      "unknownExecutor": "Unknown Executor"
    },
    "guildEvents": {
      "explicitContentFilterLevels": {
        "0": "Disabled",
        "1": "Members Without Roles",
        "2": "All Members"
      },
      "guildUpdate": {
        "afkChannelChange": {
          "embed": {
            "description": "> **Old AFK Channel**: {{old_channel}}\n> **New AFK Channel**: {{new_channel}}",
            "title": "Server AFK Channel Changed"
          }
        },
        "afkTimeoutChange": {
          "embed": {
            "description": "> **Old AFK Timeout**: {{old_timeout}}\n> **New AFK Timeout**: {{new_timeout}}",
            "title": "Server AFK Timeout Changed"
          }
        },
        "bannerChange": {
          "embed": {
            "description": "> **Old Banner**: {{old_banner}}\n> **New Banner**: {{new_banner}}",
            "title": "Server Banner Changed"
          }
        },
        "defaultMessageNotificationsChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server Default Message Notifications Changed"
          }
        },
        "descriptionChange": {
          "embed": {
            "description": "> **Old Description**: {{old_description}}\n> **New Description**: {{new_description}}",
            "title": "Server Description Changed"
          }
        },
        "discoverySplashChange": {
          "embed": {
            "description": "> **Old Discovery Splash**: {{old_discovery_splash}}\n> **New Discovery Splash**: {{new_discovery_splash}}",
            "title": "Server Discovery Splash Changed"
          }
        },
        "explicitContentFilterChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server Explicit Content Filter Changed"
          }
        },
        "featuresChange": {
          "embed": {
            "added": "Added",
            "removed": "Removed",
            "title": "Server Features Changed"
          }
        },
        "iconChange": {
          "embed": {
            "description": "> **Old Icon**: {{old_icon}}\n> **New Icon**: {{new_icon}}",
            "title": "Server Icon Changed"
          }
        },
        "mfaLevelChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server MFA Level Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Server Name Changed"
          }
        },
        "nsfwLevelChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server NSFW Level Changed"
          }
        },
        "ownerChange": {
          "embed": {
            "description": "> **Old Owner**: {{old_owner}}\n> **New Owner**: {{new_owner}}",
            "title": "Server Owner Changed"
          }
        },
        "partneredChange": {
          "embed": {
            "description": "> **Old Status**: {{old_status}}\n> **New Status**: {{new_status}}",
            "title": "Server Partnered Status Changed"
          }
        },
        "preferredLocaleChange": {
          "embed": {
            "description": "> **Old Locale**: {{old_locale}}\n> **New Locale**: {{new_locale}}",
            "title": "Server Preferred Locale Changed"
          }
        },
        "premiumProgressBarChange": {
          "embed": {
            "description": "> **Old Status**: {{old_progress_bar}}\n> **New Status**: {{new_progress_bar}}",
            "title": "Server Boost Progress Bar Changed"
          }
        },
        "premiumSubscriptionCountChange": {
          "embed": {
            "description": "> **Old Count**: {{old_count}}\n> **New Count**: {{new_count}}",
            "title": "Server Boost Count Changed"
          }
        },
        "premiumTierChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server Boost Level Changed"
          }
        },
        "publicUpdatesChannelChange": {
          "embed": {
            "description": "> **Old Public Updates Channel**: {{old_channel}}\n> **New Public Updates Channel**: {{new_channel}}",
            "title": "Server Public Updates Channel Changed"
          }
        },
        "rulesChannelChange": {
          "embed": {
            "description": "> **Old Rules Channel**: {{old_channel}}\n> **New Rules Channel**: {{new_channel}}",
            "title": "Server Rules Channel Changed"
          }
        },
        "safetyAlertsChannelChange": {
          "embed": {
            "description": "> **Old Safety Alerts Channel**: {{old_channel}}\n> **New Safety Alerts Channel**: {{new_channel}}",
            "title": "Server Safety Alerts Channel Changed"
          }
        },
        "splashChange": {
          "embed": {
            "description": "> **Old Splash**: {{old_splash}}\n> **New Splash**: {{new_splash}}",
            "title": "Server Splash Changed"
          }
        },
        "systemChannelChange": {
          "embed": {
            "description": "> **Old System Channel**: {{old_channel}}\n> **New System Channel**: {{new_channel}}",
            "title": "Server System Channel Changed"
          }
        },
        "systemChannelFlagsChange": {
          "embed": {
            "description": "> **Old Flags**: {{old_flags}}\n> **New Flags**: {{new_flags}}",
            "title": "Server System Channel Flags Changed"
          }
        },
        "vanityUrlCodeChange": {
          "embed": {
            "description": "> **Old Vanity URL**: {{old_code}}\n> **New Vanity URL**: {{new_code}}",
            "title": "Server Vanity URL Changed"
          }
        },
        "verificationLevelChange": {
          "embed": {
            "description": "> **Old Level**: {{old_level}}\n> **New Level**: {{new_level}}",
            "title": "Server Verification Level Changed"
          }
        },
        "verifiedChange": {
          "embed": {
            "description": "> **Old Status**: {{old_status}}\n> **New Status**: {{new_status}}",
            "title": "Server Verified Status Changed"
          }
        },
        "widgetChannelChange": {
          "embed": {
            "description": "> **Old Widget Channel**: {{old_channel}}\n> **New Widget Channel**: {{new_channel}}",
            "title": "Server Widget Channel Changed"
          }
        },
        "widgetEnabledChange": {
          "embed": {
            "description": "> **Old Status**: {{old_status}}\n> **New Status**: {{new_status}}",
            "title": "Server Widget Enabled Status Changed"
          }
        }
      },
      "mfaLevels": {
        "0": "None",
        "1": "Elevated"
      },
      "none": "None",
      "notificationLevels": {
        "0": "All Messages",
        "1": "Only @mentions"
      },
      "nsfwLevels": {
        "0": "Default",
        "1": "Explicit",
        "2": "Safe",
        "3": "Age Restricted"
      },
      "unknownExecutor": "Unknown Executor",
      "verificationLevels": {
        "0": "None",
        "1": "Low",
        "2": "Medium",
        "3": "High",
        "4": "Very High"
      }
    },
    "guildScheduledEvents": {
      "guildScheduledEventCreate": {
        "externalChannel": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Location**: {{event.entityMetadata.location}}\n> **Description**: {{event.description}}\n> **Start Time**: {{scheduled_start_time}}\n> **End Time**: {{scheduled_end_time}}",
            "title": "Guild Scheduled Event Created"
          }
        },
        "voiceChannel": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Channel**: {{event.channel.name}} (<#{{event.channel.id}}>)\n> **Description**: {{event.description}}\n> **Start Time**: {{scheduled_start_time}}",
            "title": "Guild Scheduled Event Created"
          }
        }
      },
      "guildScheduledEventDelete": {
        "externalChannel": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Location**: {{event.entityMetadata.location}}\n> **Description**: {{event.description}}\n> **Start Time**: {{scheduled_start_time}}\n> **End Time**: {{scheduled_end_time}}",
            "title": "Guild Scheduled Event Deleted"
          }
        },
        "voiceChannel": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Channel**: {{event.channel.name}} (<#{{event.channel.id}}>)\n> **Description**: {{event.description}}\n> **Start Time**: {{scheduled_start_time}}",
            "title": "Guild Scheduled Event Deleted"
          }
        }
      },
      "guildScheduledEventUpdate": {
        "descriptionChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old Description**: {{old_description}}\n> **New Description**: {{new_description}}",
            "title": "Guild Scheduled Event Description Changed"
          }
        },
        "endTimeChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old End**: {{old_end_time}}\n> **New End**: {{new_end_time}}",
            "title": "Guild Scheduled Event End Time Changed"
          }
        },
        "imageChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old Image**: {{old_image}}\n> **New Image**: {{new_image}}",
            "title": "Guild Scheduled Event Image Changed"
          }
        },
        "locationChange": {
          "embed": {
            "title": "Guild Scheduled Event Location Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Guild Scheduled Event Name Changed"
          }
        },
        "startTimeChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old Start**: {{old_start_time}}\n> **New Start**: {{new_start_time}}",
            "title": "Guild Scheduled Event Start Time Changed"
          }
        },
        "statusChange": {
          "embed": {
            "description": "> **Name**: {{event.name}}\n> **ID**: {{event.id}}\n> **Old Status**: {{old_status}}\n> **New Status**: {{new_status}}",
            "title": "Guild Scheduled Event Status Changed"
          },
          "status": {
            "1": "Scheduled",
            "2": "Active",
            "3": "Completed",
            "4": "Canceled"
          }
        }
      },
      "guildScheduledEventUserAdd": {
        "embed": {
          "description": "> **User**: {{user.username}} (<@{{user.id}}>)\n> **User ID**: {{user.id}}\n> **Event Name**: {{event.name}}\n> **Event ID**: {{event.id}}",
          "title": "User Subscribed To Event"
        }
      },
      "guildScheduledEventUserRemove": {
        "embed": {
          "description": "> **User**: {{user.username}} (<@{{user.id}}>)\n> **User ID**: {{user.id}}\n> **Event Name**: {{event.name}}\n> **Event ID**: {{event.id}}",
          "title": "User Unsubscribed From Event"
        }
      },
      "noDescription": "No description provided",
      "noLocation": "No location provided",
      "unknownChannel": "Unknown Channel",
      "unknownExecutor": "Unknown Executor"
    },
    "guildSoundboardEvents": {
      "guildSoundboardSoundCreate": {
        "embed": {
          "description": "> **Name**: {{sound.name}}\n> **ID**: {{sound.soundId}}\n> **Emoji**: {{sound.emoji}}\n> **Volume**: {{volume}}%\n> **Created At**: {{timestamp}}",
          "title": "Sound Created"
        }
      },
      "guildSoundboardSoundDelete": {
        "embed": {
          "description": "> **Name**: {{sound.name}}\n> **ID**: {{sound.soundId}}\n> **Emoji**: {{sound.emoji}}\n> **Volume**: {{volume}}%\n> **Deleted At**: {{timestamp}}",
          "title": "Sound Deleted"
        }
      },
      "guildSoundboardSoundUpdate": {
        "emojiChange": {
          "embed": {
            "description": "> **Name**: {{sound.name}}\n> **ID**: {{sound.soundId}}\n> **Old Emoji**: {{old_emoji}}\n> **New Emoji**: {{new_emoji}}",
            "title": "Sound Emoji Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **ID**: {{sound.soundId}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Sound Name Changed"
          }
        },
        "noEmoji": "No emoji",
        "noPreviousValue": "No previous value",
        "volumeChange": {
          "embed": {
            "description": "> **Name**: {{sound.name}}\n> **ID**: {{sound.soundId}}\n> **Old Volume**: {{old_volume}}%\n> **New Volume**: {{new_volume}}%,",
            "title": "Sound Volume Changed"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "inviteEvents": {
      "inviteCreate": {
        "embed": {
          "description": "> **Code**: {{invite.code}}\n> **Channel**: <#{{invite.channelId}}>\n> **Expires At**: {{timestamp}}\n> **Max Usage**: {{usage}}",
          "title": "Invite Created"
        }
      },
      "inviteDelete": {
        "embed": {
          "description": "> **Code**: {{invite.code}}\n> **Channel**: <#{{invite.channelId}}>",
          "title": "Invite Deleted"
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "memberEvents": {
      "memberRemove": {
        "embed": {
          "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Joined For**: {{timestamp}}\n> **Member Count**: {{member_count}}",
          "fields": {
            "reason": "Reason"
          },
          "title": "User Left Server",
          "titleKicked": "User Kicked From Server"
        },
        "joinDateUnknown": "Join date unknown",
        "noReason": "No reason provided."
      },
      "memberUpdate": {
        "nicknameChange": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Old Nickname**: {{old_nickname}}\n> **New Nickname**: {{new_nickname}}",
            "title": "User Nickname Changed"
          },
          "noNickname": "No Nickname"
        },
        "removeTimeout": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}",
            "title": "User Timeout Removed"
          }
        },
        "rolesUpdate": {
          "embed": {
            "added": "Roles Added",
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}",
            "removed": "Roles Removed",
            "title": "User Roles Updated"
          }
        },
        "timeout": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Timeout Until**: {{timestamp}}",
            "fields": {
              "reason": "Reason"
            },
            "title": "User Timed Out"
          },
          "noReason": "No reason provided for timeout."
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "messageEvents": {
      "messageBulkDelete": {
        "embed": {
          "description": "> **Channel**: {{message.channel.name}} (<#{{message.channel.id}}>)",
          "title": "{{count}} Message(s) Deleted"
        },
        "fileName": "deleted_messages.txt",
        "message": "**Message ID:** {{message.id}} **Author:** {{message.author.tag}} **Content:** {{message.content}}"
      },
      "messageCreate": {
        "pollCreate": {
          "embed": {
            "description": "> **Expires At**: {{timestamp}}\n> **Multi Select**: {{multi_select}}\n> **Message**: {{message.url}}",
            "title": "Poll Created"
          }
        }
      },
      "messageDelete": {
        "embed": {
          "description": "> **Channel**: {{message.channel.name}} (<#{{message.channel.id}}>)\n> **Author**: {{message.author.tag}} (<@{{message.author.id}}>)\n> **Message ID**: [{{message.id}}](https://discord.com/channels/{{message.guild.id}}/{{message.channel.id}}/{{message.id}})\n> **Created At**: {{timestamp}}",
          "fields": {
            "attachments": "{{count}} Attachment(s)",
            "content": "Message"
          },
          "title": "Message Deleted"
        },
        "pollDelete": {
          "embed": {
            "description": "> **Expired at**: {{timestamp}}\n> **Multi Select**: {{multi_select}}\n> **Finalized**: {{finalized}}\n> **Channel**: <#{{message.channel.id}}>\n> **Message ID**: {{message.id}}\n> **Sent by**: <@{{message.author.id}}>",
            "title": "Poll Deleted"
          }
        },
        "skippedFiles": "⚠️ Skipped Large Files"
      },
      "messagePollVoteAdd": {
        "embed": {
          "description": "> **Question**: {{question}}\n> **Answer**: {{answer}} <@{{answerer}}>\n> **Expired At**: {{timestamp}}\n> **Multi Select**: {{multi_select}}\n> **Message**: {{message.url}}",
          "title": "Poll Votes Add"
        }
      },
      "messagePollVoteRemove": {
        "embed": {
          "description": "> **Question**: {{question}}\n> **Answer**: {{answer}} <@{{answerer}}>\n> **Expired At**: {{timestamp}}\n> **Multi Select**: {{multi_select}}\n> **Message**: {{message.url}}",
          "title": "Poll Votes Remove"
        }
      },
      "messageUpdate": {
        "embed": {
          "description": "> **Channel**: {{message.channel.name}} (<#{{message.channel.id}}>)\n> **Author**: {{message.author.tag}} (<@{{message.author.id}}>)\n> **Message ID**: [{{message.id}}](https://discord.com/channels/{{message.guild.id}}/{{message.channel.id}}/{{message.id}})",
          "fields": {
            "newContent": "After",
            "oldContent": "Before"
          },
          "title": "Message Edited"
        },
        "errors": {
          "noContent": "⚠️ Could not retrieve message content before or after the edit."
        },
        "pollEnd": {
          "embed": {
            "description": "> **Expired At**: {{timestamp}}\n> **Multi Select**: {{multi_select}}\n> **Message**: {{message.url}}",
            "title": "Poll Ended"
          },
          "unknownQuestion": "Unknown Question",
          "unknownTime": "Unknown Time",
          "unknownUser": "Unknown User"
        }
      }
    },
    "roleEvents": {
      "roleCreate": {
        "embed": {
          "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Color**: {{role_color}}\n> **Hoisted**: {{role_hoist}}\n> **Mentionable**: {{role_mentionable}}\n> **Position**: {{role.position}}\n> **Created At**: {{timestamp}}\n> **Permissions**: {{permissions}}",
          "title": "Role Created"
        }
      },
      "roleDelete": {
        "embed": {
          "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Color**: {{role_color}}\n> **Hoisted**: {{role_hoist}}\n> **Mentionable**: {{role_mentionable}}\n> **Position**: {{role.position}}\n> **Deleted At**: {{timestamp}}\n> **Permissions**: {{permissions}}",
          "title": "Role Deleted"
        }
      },
      "roleUpdate": {
        "colorChange": {
          "embed": {
            "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Old Color**: {{old_color}}\n> **New Color**: {{new_color}}",
            "title": "Role Color Changed"
          }
        },
        "hoistChange": {
          "embed": {
            "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Old Hoist Status**: {{old_hoist}}\n> **New Hoist Status**: {{new_hoist}}",
            "title": "Role Hoisted Changed"
          }
        },
        "iconChange": {
          "embed": {
            "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Old Icon**: {{old_icon}}\n> **New Icon**: {{new_icon}}",
            "title": "Role Icon Changed"
          }
        },
        "mentionableChange": {
          "embed": {
            "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n> **Old Mentionable Status**: {{old_mentionable}}\n> **New Mentionable Status**: {{new_mentionable}}",
            "title": "Role Mentionable Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **ID**: {{role.id}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Role Name Changed"
          }
        },
        "permissionsChange": {
          "embed": {
            "description": "> **Role**: {{role.name}}\n> **ID**: {{role.id}}\n**Changes**: {{changes}}",
            "title": "Role Permissions Changed"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "stageInstanceEvents": {
      "stageInstanceCreate": {
        "embed": {
          "description": "> **Channel**: <#{{stage.channelId}}>\n> **Topic**: {{stage.topic}}",
          "title": "Stage Started"
        }
      },
      "stageInstanceDelete": {
        "embed": {
          "description": "> **Channel**: <#{{stage.channelId}}>\n> **Topic**: {{stage.topic}}",
          "title": "Stage Ended"
        }
      },
      "stageInstanceUpdate": {
        "topicChange": {
          "embed": {
            "description": "> **Channel**: <#{{stage.channelId}}>\n> **Old Topic**: {{old_topic}}\n> **New Topic**: {{new_topic}}",
            "title": "Stage Topic Changed"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "stickerEvents": {
      "stickerCreate": {
        "embed": {
          "description": "> **Name**: {{sticker.name}}\n> **ID**: {{sticker.id}}\n> **Description**: {{sticker.description}}\n> **Tags**: {{sticker.tags}}",
          "title": "Sticker Created"
        }
      },
      "stickerDelete": {
        "embed": {
          "description": "> **Name**: {{sticker.name}}\n> **ID**: {{sticker.id}}\n> **Description**: {{sticker.description}}\n> **Tags**: {{sticker.tags}}",
          "title": "Sticker Deleted"
        }
      },
      "stickerUpdate": {
        "descriptionChange": {
          "embed": {
            "description": "> **Name**: {{sticker.name}}\n> **ID**: {{sticker.id}}\n> **Old Description**: {{old_description}}\n> **New Description**: {{new_description}}",
            "title": "Sticker Description Changed"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **Name**: {{sticker.name}}\n> **ID**: {{sticker.id}}\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Sticker Name Changed"
          }
        },
        "tagsChange": {
          "embed": {
            "description": "> **Name**: {{sticker.name}}\n> **ID**: {{sticker.id}}\n> **Old Tags**: {{old_tags}}\n> **New Tags**: {{new_tags}}",
            "title": "Sticker Tags Changed"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "threadEvents": {
      "noParentId": "No Parent Channel ID",
      "noParentName": "No Parent Channel",
      "threadAutoArchiveDuration": {
        "10080": "1 Week",
        "1440": "1 Day",
        "4320": "3 Days",
        "60": "1 Hour",
        "null": "Default"
      },
      "threadCreate": {
        "embed": {
          "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)\n> **Auto Archive Duration**: {{auto_archive_duration}}\n> **Created At**: {{timestamp}}",
          "title": "Thread Created"
        }
      },
      "threadDelete": {
        "embed": {
          "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)\n> **Auto Archive Duration**: {{auto_archive_duration}}\n> **Created**: {{timestamp}}",
          "title": "Thread Deleted"
        }
      },
      "threadUpdate": {
        "archive": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)",
            "title": "Thread Archived"
          }
        },
        "autoArchiveDurationChange": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)\n> **Old Auto Archive Duration**: {{old_duration}}\n> **New Auto Archive Duration**: {{new_duration}}",
            "title": "Thread Auto Archive Duration Changed"
          }
        },
        "lock": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)",
            "title": "Thread Locked"
          }
        },
        "nameChange": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)\n> **Old Name**: {{old_name}}\n> **New Name**: {{new_name}}",
            "title": "Thread Name Changed"
          }
        },
        "rateLimitChange": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)\n> **Old Rate Limit**: {{old_rate_limit}}\n> **New Rate Limit**: {{new_rate_limit}}",
            "title": "Thread Rate Limit Changed"
          }
        },
        "unarchive": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)",
            "title": "Thread Unarchived"
          }
        },
        "unlock": {
          "embed": {
            "description": "> **Thread**: {{thread.name}} (<#{{thread.id}}>)\n> **ID**: {{thread.id}}\n> **Parent Channel**: {{parent.name}} (<#{{parent.id}}>)",
            "title": "Thread Unlocked"
          }
        }
      },
      "unknownExecutor": "Unknown Executor"
    },
    "voiceStateEvents": {
      "voiceStateUpdate": {
        "join": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **Joined At**: {{timestamp}}",
            "title": "User Joined Voice Channel"
          }
        },
        "leave": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Channel**: {{channel.name}} (<#{{channel.id}}>)\n> **Left At**: {{timestamp}}",
            "title": "User Left Voice Channel",
            "titleKicked": "User Kicked from Voice Channel"
          }
        },
        "move": {
          "embed": {
            "description": "> **User**: {{user.tag}} (<@{{user.id}}>)\n> **ID**: {{user.id}}\n> **Old Channel**: {{oldChannel.name}} (<#{{oldChannel.id}}>)\n> **New Channel**: {{newChannel.name}} (<#{{newChannel.id}}>)",
            "title": "User Moved Voice Channel"
          }
        }
      }
    }
  },
  "permissions": {
    "allowed": "Allowed",
    "denied": "Denied",
    "overwriteAdded": "Overwrite added",
    "overwriteRemoved": "Overwrite removed",
    "permissions": {
      "AddReactions": "Add Reactions",
      "Administrator": "Administrator",
      "AttachFiles": "Attach Files",
      "BanMembers": "Ban Members",
      "BypassSlowmode": "Bypass Slowmode",
      "ChangeNickname": "Change Nickname",
      "Connect": "Connect",
      "CreateEvents": "Create Events",
      "CreateGuildExpressions": "Create Server Expressions",
      "CreateInstantInvite": "Create Instant Invite",
      "CreatePrivateThreads": "Create Private Threads",
      "CreatePublicThreads": "Create Public Threads",
      "DeafenMembers": "Deafen Members",
      "EmbedLinks": "Embed Links",
      "KickMembers": "Kick Members",
      "ManageChannels": "Manage Channels",
      "ManageEmojisAndStickers": "Manage Emojis and Stickers",
      "ManageEvents": "Manage Events",
      "ManageGuild": "Manage Server",
      "ManageGuildExpressions": "Manage Server Expressions",
      "ManageMessages": "Manage Messages",
      "ManageNicknames": "Manage Nicknames",
      "ManageRoles": "Manage Roles",
      "ManageThreads": "Manage Threads",
      "ManageWebhooks": "Manage Webhooks",
      "MentionEveryone": "Mention Everyone",
      "ModerateMembers": "Moderate Members",
      "MoveMembers": "Move Members",
      "MuteMembers": "Mute Members",
      "PinMessages": "Pin Messages",
      "PrioritySpeaker": "Priority Speaker",
      "ReadMessageHistory": "Read Message History",
      "RequestToSpeak": "Request to Speak",
      "SendMessages": "Send Messages",
      "SendMessagesInThreads": "Send Messages in Threads",
      "SendPolls": "Send Polls",
      "SendTTSMessages": "Send Text-to-Speech Messages",
      "SendVoiceMessages": "Send Voice Messages",
      "Speak": "Speak",
      "Stream": "Stream",
      "UseApplicationCommands": "Use Application Commands",
      "UseEmbeddedActivities": "Use Embedded Activities",
      "UseExternalApps": "Use External Apps",
      "UseExternalEmojis": "Use External Emojis",
      "UseExternalSounds": "Use External Sounds",
      "UseExternalStickers": "Use External Stickers",
      "UseSoundboard": "Use Soundboard",
      "UseVAD": "Use Voice Activity",
      "ViewAuditLog": "View Audit Log",
      "ViewChannel": "View Channel",
      "ViewCreatorMonetizationAnalytics": "View Creator Monetization Analytics",
      "ViewGuildInsights": "View Server Insights"
    },
    "unset": "Unset"
  },
  "system-channel-flags": {
    "SuppressGuildReminderNotifications": "Suppress Server Tips",
    "SuppressJoinNotificationReplies": "Suppress Join Replies",
    "SuppressJoinNotifications": "Suppress Join Messages",
    "SuppressPremiumSubscriptions": "Suppress Server Boosts",
    "SuppressRoleSubscriptionPurchaseNotificationReplies": "Suppress Role Sub Replies",
    "SuppressRoleSubscriptionPurchaseNotifications": "Suppress Role Sub Purchase"
  },
  "translations": {
    "checkExpiredModmailBlacklists": {
      "expiredModmailBlacklistNotification": "🔔 Modmail blacklist for **{{guild}}** expired"
    },
    "checkPunishments": {
      "banExpired": "Ban expired after {{duration}}.",
      "muteExpired": "Mute expired after {{duration}}."
    },
    "configPanels": {
      "miscConfig": {
        "language": {
          "description": "Guild Language\nThe language the bot will use in this server."
        },
        "modMailMessage": {
          "buttonLabel": "Edit Mod-Mail Message",
          "description": "Mod-Mail Message\nThe message that will be sent by the bot when a user sends a mod-mail.\n-# {{limit}}/2000 characters used.",
          "resetButtonLabel": "Reset Mod-Mail Message"
        }
      },
      "navigation": {
        "misc": "Miscellaneous Configuration",
        "placeholder": "Select a configuration panel...",
        "prompt": "Use the buttons below to navigate through the configuration panels.",
        "role": "Role Configuration",
        "welcomeLeave": "Welcome & Leave Configuration"
      },
      "roleConfig": {
        "colourIdOfTheDay": {
          "description": "Colour of the Day Role\nA role that changes colour every day.",
          "placeholder": "No colour of the day role set."
        },
        "femaleRoleId": {
          "description": "Female Role\nThe role given when a member registers as female",
          "placeholder": "No female role set."
        },
        "maleRoleId": {
          "description": "Male Role\nThe role given when a member registers as male",
          "placeholder": "No male role set."
        },
        "memberRoleId": {
          "description": "Member Role\nThe role given when a member registers. If the registration module is disabled it is given when a member joins the server.",
          "placeholder": "No member role set."
        },
        "muteRoleId": {
          "description": "Mute Role\nThe role given when a member is muted.",
          "placeholder": "No mute role set."
        },
        "unverifiedRoleId": {
          "description": "Unverified Role\nThe role given when a member joins the server if the registration module is enabled.",
          "placeholder": "No unverified role set."
        }
      },
      "welcomeLeaveConfig": {
        "joinChannelId": {
          "description": "Welcome Channel\nThe channel where the welcome message will be sent.\n-# {{limit}}/2000 characters used.",
          "placeholder": "No welcome channel set.",
          "testButtonLabel": "Test Welcome Message"
        },
        "joinMessage": {
          "buttonLabel": "Edit Welcome Message",
          "description": "Welcome Message\nThe message that will be sent when a member joins the server.\n-# {{limit}}/2000 characters used.",
          "resetButtonLabel": "Reset Welcome Message"
        },
        "leaveChannelId": {
          "description": "Leave Channel\nThe channel where the leave message will be sent.",
          "placeholder": "No leave channel set."
        },
        "leaveMessage": {
          "buttonLabel": "Edit Leave Message",
          "description": "Leave Message\nThe message that will be sent when a member leaves the server.\n-# {{limit}}/2000 characters used.",
          "resetButtonLabel": "Reset Leave Message"
        }
      }
    },
    "dynamicChannel": {
      "initial": "Select a channel below...",
      "labels": {
        "channelLogsChannelId": "Channel Logs",
        "emojiLogsChannelId": "Emoji Logs",
        "eventLogsChannelId": "Event Logs",
        "guildLogsChannelId": "Guild Logs",
        "guildMemberLogsChannelId": "Member Logs",
        "inviteLogsChannelId": "Invite Logs",
        "joinChannelId": "Welcome Channel",
        "leaveChannelId": "Leave Channel",
        "messageLogsChannelId": "Message Logs",
        "modLogsChannelId": "Moderation Logs",
        "modMailChannelId": "Mod-Mail Channel",
        "pollLogsChannelId": "Poll Logs",
        "registerChannelId": "Register Channel",
        "registerJoinChannelId": "Register Join Channel",
        "roleLogsChannelId": "Role Logs",
        "soundboardLogsChannelId": "Soundboard Logs",
        "stageLogsChannelId": "Stage Logs",
        "stickerLogsChannelId": "Sticker Logs",
        "threadLogsChannelId": "Thread Logs",
        "voiceLogsChannelId": "Voice Logs",
        "webhookLogsChannelId": "Webhook Logs"
      },
      "messages": {
        "set": "Successfully set **{{label}}** to {{channel}}.",
        "unset": "Successfully disabled **{{label}}**."
      },
      "timeout": "Menu timed out."
    },
    "dynamicMessage": {
      "initial": "Set a {{label}} message below with a modal",
      "labels": {
        "joinMessage": "Welcome",
        "leaveMessage": "Leave",
        "modMailMessage": "Mod-Mail",
        "registerJoinMessage": "Register"
      },
      "messages": {
        "set": "Successfully set **{{label}}** message.",
        "unset": "Successfully removed **{{label}}** message."
      },
      "timeout": "Message timed out.",
      "title": "Set {{label}} Message"
    },
    "dynamicRole": {
      "errors": {
        "roleTooHigh": "The role you selected is too high. Please select a role that is lower than the bot's role."
      },
      "initial": "Select a role below...",
      "labels": {
        "colourIdOfTheDay": "Colour of the Day Role",
        "djRoleId": "DJ Role",
        "femaleRoleId": "Female Role",
        "maleRoleId": "Male Role",
        "memberRoleId": "Member Role",
        "muteRoleId": "Mute Role",
        "staffRoleId": "Staff Role",
        "unverifiedRoleId": "Unverified Role"
      },
      "messages": {
        "set": "Successfully set **{{label}}** to {{role}}.",
        "unset": "Successfully disabled **{{label}}**."
      },
      "timeout": "Menu timed out."
    },
    "infractionsPunishment": {
      "alreadyMuted": "The user is already muted.",
      "databaseError": "An error occurred while trying to add the infraction to the database. Please try again later.",
      "messages": {
        "ban": "You have been banned from **{{guild}}**. Reason: ```{{reason}}```",
        "kick": "You have been kicked from **{{guild}}**. Reason: ```{{reason}}```",
        "mute": "You have been muted in **{{guild}}** for **{{duration}}**. Reason: ```{{reason}}```",
        "tempBan": "You have been temporarily banned from **{{guild}}** for **{{duration}}**. Reason:```{{reason}}```"
      },
      "muteError": "An error occurred while trying to mute the user. Please check the bot's permissions and try again.",
      "noMuteRole": "The mute role is not set. Please set the mute role in the moderation config to use this feature.",
      "noPermission": "I do not have the required permissions to perform this action. Please ensure I have the appropriate permissions and try again.",
      "reason": "Automatic punishment escalation (strike {{level}})",
      "roleError": "An error occurred while trying to add/remove a role. Please check the bot's permissions and try again."
    },
    "joinLeaveConfig": {
      "joinChannelId": {
        "description": "The channel where the welcome message will be sent.",
        "label": "Set Welcome Channel"
      },
      "joinMessage": {
        "description": "The message that will be sent when a member joins the server.",
        "label": "Set Welcome Message"
      },
      "leaveChannelId": {
        "description": "The channel where the leave message will be sent.",
        "label": "Set Leave Channel"
      },
      "leaveMessage": {
        "description": "The message that will be sent when a member leaves the server.",
        "label": "Set Leave Message"
      }
    },
    "logConfig": {
      "channelLogsChannelId": {
        "description": "The channel where channel update logs will be sent.",
        "label": "Set Channel Logs Channel"
      },
      "emojiLogsChannelId": {
        "description": "The channel where emoji update logs will be sent.",
        "label": "Set Emoji Logs Channel"
      },
      "eventLogsChannelId": {
        "description": "The channel where event logs will be sent.",
        "label": "Set Event Logs Channel"
      },
      "guildLogsChannelId": {
        "description": "The channel where guild update logs will be sent.",
        "label": "Set Guild Logs Channel"
      },
      "guildMemberLogsChannelId": {
        "description": "The channel where member update logs will be sent.",
        "label": "Set Member Logs Channel"
      },
      "inviteLogsChannelId": {
        "description": "The channel where invite logs will be sent.",
        "label": "Set Invite Logs Channel"
      },
      "messageLogsChannelId": {
        "description": "The channel where; message delete, message update, bulk delete logs will be sent.",
        "label": "Set Message Logs Channel"
      },
      "pollLogsChannelId": {
        "description": "The channel where poll logs will be sent.",
        "label": "Set Poll Logs Channel"
      },
      "roleLogsChannelId": {
        "description": "The channel where role update logs will be sent.",
        "label": "Set Role Logs Channel"
      },
      "soundboardLogsChannelId": {
        "description": "The channel where soundboard logs will be sent.",
        "label": "Set Soundboard Logs Channel"
      },
      "stageLogsChannelId": {
        "description": "The channel where stage logs will be sent.",
        "label": "Set Stage Logs Channel"
      },
      "stickerLogsChannelId": {
        "description": "The channel where sticker update logs will be sent.",
        "label": "Set Sticker Logs Channel"
      },
      "threadLogsChannelId": {
        "description": "The channel where thread logs will be sent.",
        "label": "Set Thread Logs Channel"
      },
      "voiceLogsChannelId": {
        "description": "The channel where voice update logs will be sent.",
        "label": "Set Voice Logs Channel"
      },
      "webhookLogsChannelId": {
        "description": "The channel where webhook logs will be sent.",
        "label": "Set Webhook Logs Channel"
      }
    },
    "miscConfig": {
      "language": {
        "description": "The language the bot will use."
      },
      "modMailMessage": {
        "description": "The message that will be sent by the bot when a user sends a mod-mail."
      }
    },
    "modLog": {
      "ban": "{{emoji}}  **{{user.username}}** has been banned by **{{moderator.username}}**. Reason:```{{reason}}```",
      "banExpired": "🔓 User (`{{user.id}}`) has been automatically unbanned by **{{moderator.username}}** after **{{duration}}**. Reason:```{{reason}}```",
      "functionErrors": {
        "caseIdError": "An error occurred while trying to increment the case ID. This is likely a database error on our side. This may cause duplicate case IDs. Please report this to the bot developers."
      },
      "kick": "👢  **{{user.username}}** has been kicked by **{{moderator.username}}**. Reason:```{{reason}}```",
      "mute": "🔇  **{{user.username}}** has been muted by **{{moderator.username}}** for **{{duration}}**. Reason:```{{reason}}```",
      "timedBan": "{{emoji}}  **{{user.username}}** has been banned by **{{moderator.username}}** for **{{duration}}**. Reason:```{{reason}}```",
      "timeout": "🔇 **{{user.username}}** has been timed out by **{{moderator.username}}** for **{{duration}}**. Reason:```{{reason}}```",
      "unban": "🔓 User (`{{user.id}}`) has been unbanned by **{{moderator.username}}**. Reason:```{{reason}}```",
      "unmute": "🔊  **{{user.username}}** has been unmuted by **{{moderator.username}}**. Reason:```{{reason}}```",
      "warning": "⚠️ **{{user.username}}** has been warned by **{{moderator.username}}**. Reason:```{{reason}}```"
    },
    "modMailLog": {
      "bot": "[BOT]",
      "closeMessage": "Thread #{{thread_id}} with {{user.tag}} ({{user.id}}) has been closed by {{closer.tag}} ({{closer.id}}). **{{messages.user}}** messages from user, **{{messages.staff}}** messages from staff, **{{messages.internal}}** internal messages.",
      "command": "[COMMAND]",
      "fromUser": "[FROM USER]",
      "initial": "# Mod-mail thread #{{thread_id}} with {{user.tag}} {{user.id}} started at {{time}}. All times are in GMT.",
      "preparingClose": "Thread is being closed...",
      "threadClosedDm": "Your thread in {{guild}} has been closed.",
      "toThread": "[TO THREAD]",
      "toUser": "[TO USER]"
    },
    "moderationConfig": {
      "defaultExpiry": {
        "description": "The default expiry for infractions.",
        "descriptionFourteen": "Sets the default expiry to 14 days.",
        "descriptionSeven": "Sets the default expiry to 7 days.",
        "descriptionThirty": "Sets the default expiry to 30 days.",
        "descriptionZero": "Disables the default expiry.",
        "label": "Set Default Expiry",
        "labelFourteen": "Set Default Expiry 14 Days",
        "labelSeven": "Set Default Expiry 7 Days",
        "labelThirty": "Set Default Expiry 30 Days",
        "labelZero": "Disable Default Expiry",
        "success": "Default expiry has been set to {{days}} days."
      },
      "modLogsChannelId": {
        "description": "The channel where the moderation logs will be sent.",
        "label": "Set Mod Log Channel"
      },
      "modMailChannel": {
        "alreadySet": "Mod-mail channel is already set to {{channel}}.",
        "description": "The channel where the mod-mail will be sent.",
        "label": "Set Mod-Mail Channel",
        "set": "Mod-mail channel has been set to {{channel}}."
      },
      "muteGetAllRoles": {
        "description": "Gives all roles to the muted user.",
        "false": "Mute get all roles is disabled.",
        "label": "Mute Get All Roles",
        "true": "Mute get all roles is enabled."
      },
      "staffRoleId": {
        "description": "The role required to use moderation commands.",
        "label": "Set Staff Role"
      }
    },
    "registerConfig": {
      "registerChannelId": {
        "description": "The channel where the register command will be used.",
        "label": "Set Register Channel"
      },
      "registerClearChannel": {
        "description": "Clears the channel after a user registers.",
        "label": "Set Register Clear Channel",
        "set": "Register channel clearing is enabled.",
        "unset": "Register channel clearing is disabled."
      },
      "registerJoinChannelId": {
        "description": "The channel where the register message will be sent.",
        "label": "Set Register Join Channel"
      },
      "registerJoinMessage": {
        "description": "The message that will be sent when a member joins the server.",
        "label": "Set Register Message"
      }
    },
    "roleConfig": {
      "colourIdOfTheDay": {
        "description": "A role that changes every day.",
        "label": "Set Colour of the Day Role"
      },
      "djRoleId": {
        "description": "A role that bypasses the music command restrictions.",
        "label": "Set DJ Role"
      },
      "femaleRoleId": {
        "description": "The role given when a member registers as female",
        "label": "Set Female Role"
      },
      "maleRoleId": {
        "description": "The role given when a member registers as male.",
        "label": "Set Male Role"
      },
      "memberRoleId": {
        "description": "The role given when a member registers.",
        "label": "Set Member Role"
      },
      "muteRoleId": {
        "description": "The role given when a member is muted.",
        "label": "Set Mute Role"
      },
      "unverifiedRoleId": {
        "description": "The role given when a member joins the server if the registration module is enabled.",
        "label": "Set Unverified Role"
      }
    },
    "waitForMessageComponent": {
      "initial": "Please select an option below.",
      "timeout": "Menu timed out."
    }
  }
}

export default Resources;

import {
  getGuildChannels,
  getGuildInfo,
  getGuildRoles,
  getGuildSettings,
} from "@/utils/utils";
import { ChannelType } from "discord-api-types/v10";
import { ModerationConfigForm } from "@/app/[locale]/dashboard/[id]/moderation-settings/ModerationConfigForm";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function ModerationConfigPage({ params }: Props) {
  const guildConfig = await getGuildSettings((await params).id);
  const guildChannels = await getGuildChannels((await params).id);
  const guildRoles = await getGuildRoles((await params).id);
  if (!guildConfig?.settings) {
    return <div>Failed to load guild settings.</div>;
  }
  if (!guildChannels?.channels) {
    return <div>Failed to load guild channels.</div>;
  }
  if (!guildRoles?.roles) {
    return <div>Failed to load guild roles.</div>;
  }
  const serializedConfig = {
    modLogsChannelId: guildConfig.settings.logConfig?.modLogsChannelId ?? null,
    staffRoleId: guildConfig.settings.staffRoleId,
    modMailChannelId: guildConfig.settings.modMailChannelId,
    muteGetAllRoles: guildConfig.settings.muteGetAllRoles,
    defaultExpiry: guildConfig.settings.defaultExpiry,
  };
  const filteredChannels = guildChannels.channels.filter((channel) => {
    return channel.type === ChannelType.GuildText;
  });
  const filteredRoles = guildRoles.roles.filter((role) => {
    return role.name !== "@everyone";
  });
  const guildId = await getGuildInfo((await params).id);
  if (!guildId) {
    return <div>Failed to load guild info.</div>;
  }
  return (
    <ModerationConfigForm
      initialConfig={serializedConfig}
      guildId={(await params).id}
      channels={filteredChannels}
      roles={filteredRoles}
    />
  );
}

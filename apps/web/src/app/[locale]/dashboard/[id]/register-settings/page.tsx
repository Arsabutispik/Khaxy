import { RegisterConfigForm } from "@/app/[locale]/dashboard/[id]/register-settings/RegisterConfigForm";
import {
  getGuildChannels,
  getGuildInfo,
  getGuildSettings,
} from "@/utils/utils";
import { ChannelType } from "discord-api-types/v10";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function RegisterConfigPage({ params }: Props) {
  const guildConfig = await getGuildSettings((await params).id);
  const guildChannels = await getGuildChannels((await params).id);
  if (!guildConfig?.settings) {
    return <div>Failed to load guild settings.</div>;
  }
  if (!guildChannels?.channels) {
    return <div>Failed to load guild channels.</div>;
  }
  const serializedConfig = {
    register_join_channel_id:
      guildConfig.settings.register_join_channel_id?.toString() ?? null,
    register_channel_id:
      guildConfig.settings.register_channel_id?.toString() ?? null,
    register_join_message: guildConfig.settings.register_join_message,
  };
  const filteredChannels = guildChannels.channels.filter((channel) => {
    return channel.type === ChannelType.GuildText;
  });
  const session = await auth.api.getSession({ headers: await headers() });
  const username = session?.user?.name || "User";
  const guildId = await getGuildInfo((await params).id);
  if (!guildId) {
    return <div>Failed to load guild info.</div>;
  }
  return (
    <RegisterConfigForm
      initialConfig={serializedConfig}
      guildId={(await params).id}
      channels={filteredChannels}
      username={username}
      guildName={guildId.name}
      memberCount={guildId.memberCount}
    />
  );
}

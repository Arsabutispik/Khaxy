import { getGuildInfo } from "@/utils/utils";
import { BotProfileForm } from "./BotProfileForm";

type Props = {
  params: Promise<{ id: string; locale: string }>;
};

export default async function Home({ params }: Props) {
  const { id: guildId } = await params;
  const guildInfo = await getGuildInfo(guildId);

  if (!guildInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-zinc-400">Failed to load guild information.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6 w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400">
          Welcome to{" "}
          <span className="text-white font-medium">{guildInfo.name}</span>
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-white">Bot Profile</h2>
          <p className="text-sm text-zinc-400">
            Customize how the bot appears in this server. You can set a custom
            nickname and avatar.
          </p>
        </div>

        <BotProfileForm
          guildId={guildId}
          initialNickname={guildInfo.botNickname}
          initialAvatar={guildInfo.botAvatar}
          botUsername={guildInfo.botUsername}
          botGlobalAvatar={guildInfo.botGlobalAvatar}
        />
      </div>
    </div>
  );
}

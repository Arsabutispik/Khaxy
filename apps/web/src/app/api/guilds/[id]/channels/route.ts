// app/api/guilds/[id]/channels/route.ts

import { NextResponse } from "next/server";
// Assume you have a server function to get channels from Discord
import { getGuildChannels } from "@/utils/utils";
import { ChannelType } from "discord-api-types/v10";
import { updateConfig } from "@/actions/updateGuildConfig";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guildId = (await params).id;
  try {
    const req = await getGuildChannels(guildId);
    if (!req?.channels) {
      return new NextResponse("Guild not found", { status: 404 });
    }
    const channelOptions = req.channels
      .filter((c) => c.type === ChannelType.GuildText)
      .map((c) => ({ id: c.id, name: c.name }));

    return NextResponse.json(channelOptions);
  } catch (error) {
    console.error(`Failed to fetch channels for ${guildId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guildId = (await params).id;
  try {
    await updateConfig(guildId, await request.json());
    return new NextResponse("Configuration updated", { status: 200 });
  } catch (error) {
    console.error(`Failed to update config for ${guildId}:`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

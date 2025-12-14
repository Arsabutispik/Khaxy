import { redirect } from "next/navigation";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Guild } from "@/types/types";
import {
  fetchBotGuilds,
  fetchUserGuilds,
  getBotStatus,
  hasManageGuildPermission,
} from "@/utils/utils";
import { auth } from "@/lib/auth";
import { headers } from "next/headers.js";

export default async function DashboardPage() {
  const status = await getBotStatus();
  if (!status || status.status !== "online") {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Bot is Offline</h1>
        <p className="text-lg text-muted-foreground">
          The Discord bot is currently offline. Please try again later.
        </p>
      </div>
    );
  }
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const t = await getTranslations("Dashboard");
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "discord",
    },
    headers: await headers(),
  });
  if (!accessToken || !session?.user) {
    return redirect("/");
  }

  // NOTE: Assuming DISCORD_BOT_ID is available in your environment for invite link generation
  const BOT_ID =
    process.env.DISCORD_CLIENT_ID || process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;

  if (!BOT_ID || !session.user.id) {
    console.error(
      "Missing Bot ID or failed to extract unique user ID from image URL.",
    );
    return redirect("/");
  }

  const userAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const userId = userAccounts[0].accountId;
  const [userGuilds, botGuilds] = await Promise.all([
    fetchUserGuilds(userId, accessToken),
    fetchBotGuilds(process.env.DISCORD_BOT_TOKEN!),
  ]);

  const botGuildIds = new Set(botGuilds.map((g) => g.id));

  // Categorization Arrays
  const configurableGuilds: Guild[] = []; // User is Admin AND Bot is IN
  const inviteRequiredGuilds: Guild[] = []; // User is Admin AND Bot is NOT IN

  userGuilds.forEach((guild) => {
    const isAdmin = hasManageGuildPermission(guild.permissions);

    // Only consider servers where the user has admin permissions
    if (isAdmin) {
      const isBotIn = botGuildIds.has(guild.id);
      if (isBotIn) {
        configurableGuilds.push(guild);
      } else {
        inviteRequiredGuilds.push(guild);
      }
    }
  });

  // Define the base Bot Invite URL
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${BOT_ID}`;

  // Render Sections
  const renderGuildSection = (guilds: Guild[], emptyMessage: string) => {
    if (guilds.length === 0) {
      return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-card/50 text-muted-foreground mb-12">
          <h3 className="text-xl font-medium text-foreground">
            {t(emptyMessage)}
          </h3>
          <p className="mt-2">{t(emptyMessage)}</p>
          <Button asChild className="mt-4">
            <a href={inviteUrl} target="_blank" rel="noopener noreferrer">
              {t("invite")}
            </a>
          </Button>
        </div>
      );
    }

    // Render the grid of servers
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {guilds.map((guild) => {
          const isConfigurable = botGuildIds.has(guild.id);

          const href = isConfigurable
            ? `/dashboard/${guild.id}`
            : `${inviteUrl}&guild_id=${guild.id}`;
          const actionText = isConfigurable
            ? t("go_to_config")
            : t("add_config");

          const CardContent = (
            <>
              <CardHeader className="flex-grow flex flex-col items-center justify-center text-center p-6">
                <div className="relative w-24 h-24 mb-4">
                  {guild.icon ? (
                    <Image
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      alt={`${guild.name} icon`}
                      fill
                      className="rounded-full object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center bg-secondary rounded-full">
                      <span className="text-3xl font-bold">
                        {guild.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold">
                  {guild.name}
                </CardTitle>
              </CardHeader>
              {/* Action Indicator at the bottom of the card, replacing the button */}
              <div
                className={`p-3 border-t text-center font-medium text-sm transition-colors duration-200 ${isConfigurable ? "bg-primary text-primary-foreground group-hover:bg-primary/90" : "bg-gray-200 dark:bg-gray-800 text-foreground group-hover:bg-gray-300 dark:group-hover:bg-gray-700"}`}
              >
                {actionText}
              </div>
            </>
          );

          // CRITICAL: Wrap the entire Card in the appropriate link/anchor element
          if (isConfigurable) {
            return (
              <Link
                key={guild.id}
                href={href}
                passHref
                className="block h-full relative"
              >
                <Card className="hover:border-primary transition-colors duration-200 cursor-pointer h-full flex flex-col group">
                  {CardContent}
                </Card>
              </Link>
            );
          } else {
            return (
              <a
                key={guild.id}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                // 👈 FIX: Added 'relative' to help with mobile touch target recognition
                className="block h-full relative"
              >
                <Card className="hover:border-primary transition-colors duration-200 cursor-pointer h-full flex flex-col group">
                  {CardContent}
                </Card>
              </a>
            );
          }
        })}
      </div>
    );
  };

  // Combine both actionable guild lists for rendering
  const actionableGuilds = [...configurableGuilds, ...inviteRequiredGuilds];
  const totalServersManaged =
    configurableGuilds.length + inviteRequiredGuilds.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold mb-4 text-center">
        {t("dashboard")}
      </h1>
      <p className="text-center text-lg text-muted-foreground mb-10">
        {t("description", { count: totalServersManaged })}
      </p>

      {/* Render the single, combined list of actionable servers */}
      {renderGuildSection(actionableGuilds, "no_servers_manageable")}

      {/* Fallback message if the user is in zero guilds with admin rights */}
      {userGuilds.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Discord Servers Found</h2>
          <p className="text-muted-foreground mt-2">
            Please join a server to manage the bot.
          </p>
        </div>
      )}
    </div>
  );
}

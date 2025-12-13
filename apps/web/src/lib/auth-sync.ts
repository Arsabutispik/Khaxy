import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// How often to check Discord (e.g., once every 24 hours)
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000;

export async function getSessionWithAutoSync() {
  const ctx = await headers();
  const session = await auth.api.getSession({ headers: ctx });
  if (!session?.user) return null;

  // Check if the local data is stale
  const lastUpdated = new Date(session.user.updatedAt).getTime();
  const now = Date.now();

  // If data was updated recently, skip the fetch
  if (now - lastUpdated < SYNC_INTERVAL_MS) {
    return session;
  }
  console.log("Initiating auto-sync for user:", session.user.id);
  try {
    const { accessToken } = await auth.api.getAccessToken({
      body: {
        providerId: "discord",
      },
      headers: await headers(),
    });
    console.log("Fetched access token for user:", session.user.id);
    if (accessToken) {
      // Fetch fresh profile from Discord
      const res = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${accessToken}` },
        next: { revalidate: 0 }, // Don't cache this request
      });
      console.log("Fetched Discord profile for user:", session.user.id);
      if (res.ok) {
        console.log("Retrieved access token for user:", res.ok);
        const discordUser = await res.json();

        // Handle animated avatars
        const isAnimated = discordUser.avatar?.startsWith("a_");
        const format = isAnimated ? "gif" : "png";
        const newAvatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${format}`;

        // If the URL has changed, update the DB
        if (newAvatarUrl !== session.user.image) {
          await auth.api.updateUser({
            headers: ctx,
            body: { image: newAvatarUrl },
          });
          session.user.image = newAvatarUrl;
        }
      } else if (res.status === 401) {
        console.log("Access token invalid, signing out user:", session.user.id);
        const { success } = await auth.api.signOut({ headers: ctx }); // Access token expired or invalid
        if (success) {
          return null;
        }
      }
    }
  } catch (error) {
    console.error("Auto-sync failed:", error);
  }

  return session;
}

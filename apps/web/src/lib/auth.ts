import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";

const database = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const auth = betterAuth({
  // @ts-ignore
  database: database,
  advanced: {
    cookies: {
      state: {
        attributes: {
          secure: true,
          sameSite: "none",
        },
      },
    },
  },
  // --- THIS IS THE FIX ---
  // Apply the SameSite=None fix from the GitHub issue.
  // This tells the browser to send cookies during cross-site callbacks.
  plugins: [nextCookies()],
  // -----------------------

  socialProviders: {
    discord: {
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      scope: ["identify", "guilds"],

      mapProfileToUser: async (profile) => {
        return {
          user: {
            id: profile.id,
            name:
              profile.global_name?.toString() || profile.username.toString(),
            email: profile.email,
            emailVerified: profile.verified,
            image: profile.image_url,
          },
        };
      },
    },
  },
  session: {
    expiresIn: 7 * 24 * 60 * 60,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
});

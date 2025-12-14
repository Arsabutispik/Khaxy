import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@repo/database"],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Allow larger uploads for bot avatar images
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/avatars/**", // Pattern for user avatars
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/icons/**", // Pattern for server icons
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();
export default withNextIntl(nextConfig);

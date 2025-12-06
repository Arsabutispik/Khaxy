// middleware.ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing"; // Assuming you export these from i18n.ts

export default createMiddleware({
  // A list of all locales that are supported
  locales: routing.locales,

  // Used when no locale matches
  defaultLocale: routing.defaultLocale,

  // The `localeDetection` property is true by default.
  // This is what enables cookie and header-based routing.
  localeDetection: true,
});

export const config = {
  // Match only internationalized pathnames
  // This prevents the middleware from running on static assets and API routes
  matcher: ["/", "/(tr|en)/:path*"],
};

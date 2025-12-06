import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSideBar";
import { auth } from "@/lib/auth";
import { redirect } from "@/i18n/navigation";
import { getGuildSettings } from "@/utils/utils";
import { headers } from "next/headers.js";

async function getUserAdminStatus(
  userId: string,

  guildId: string,
): Promise<{ isAdmin: boolean; name: string; guildId: string }> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;

  const API_KEY = process.env.INTERNAL_API_KEY;

  const res = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/admin`, {
    headers: {
      "x-internal-api-key": API_KEY || "",

      "x-discord-user-id": userId,
    },

    cache: "no-store",
  });

  if (!res.ok) {
    console.error("Failed to fetch admin status:", await res.text());

    return { isAdmin: false, name: "", guildId };
  }

  return await res.json();
}

export default async function GuildModuleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; id: string }>;
}) {
  const guildId = (await params).id;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const { accessToken } = await auth.api.getAccessToken({
    body: {
      providerId: "discord",
    },
    headers: await headers(),
  });
  if (!accessToken || !session?.user || !session.user.id) {
    return redirect({
      href: "/dashboard",
      locale: (await params).locale,
    });
  }
  const userAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });
  const userId = userAccounts[0].accountId;
  const { isAdmin } = await getUserAdminStatus(userId, guildId);
  if (!isAdmin) {
    return redirect({
      href: "/dashboard",
      locale: (await params).locale,
    });
  }

  const guildSettings = await getGuildSettings(guildId);
  if (!guildSettings?.settings) {
    return redirect({
      href: "/dashboard",
      locale: (await params).locale,
    });
  }
  return (
    /* FIX 2: "fixed inset-0"
      This forces the layout to be exactly the window size,
      ignoring any margins/padding from parent layouts (like html/body).
      z-0 ensures it sits correctly in the stacking context.
    */
    <div className="fixed inset-x-0 bottom-0 top-16 z-0 flex overflow-hidden bg-black">
      <SidebarProvider className="h-full w-full">
        <AppSidebar />

        {/* FIX 3: SidebarInset
           - flex-1: Fills remaining width
           - h-full: Fills the fixed container height
           - overflow-hidden: Stops this container from scrolling
        */}
        <SidebarInset className="flex flex-col flex-1 h-full w-full overflow-hidden bg-black">
          {/* Static Header */}
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-white/10 px-4">
            <SidebarTrigger />
          </header>

          {/* FIX 4: Scroll Container
             - flex-1: Takes all vertical space left after header
             - overflow-y-auto: The ONLY place scrolling happens
          */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {/* Content Wrapper for Centering */}
            <div className="w-full max-w-4xl mx-auto">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import DiscordSignInButton from "@/components/layout/SignIn";
import { auth } from "@/lib/auth";
import { headers } from "next/headers.js";
import DiscordSignOutButton from "@/components/layout/SignOut";
import { authClient } from "@/lib/auth-client";
export async function UserNav() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const t = await getTranslations("UserNav");
  if (!session?.user) {
    return <DiscordSignInButton loginString={t("login")} />;
  }
  // If the user is logged in, show the avatar dropdown.
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={session.user.image ?? ""}
              alt={session.user.name ?? ""}
            />
            <AvatarFallback>{session.user.name?.[0]}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* The dropdown content is now much simpler. */}
      <DropdownMenuContent className="w-40" align="end" forceMount>
        <DropdownMenuItem>
          <DiscordSignOutButton logOutString={t("logout")} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

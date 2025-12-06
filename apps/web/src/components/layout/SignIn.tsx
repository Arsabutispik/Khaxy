"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function DiscordSignInButton({
  loginString,
}: {
  loginString: string;
}) {
  const handleSignIn = async (provider: string) => {
    await authClient.signIn.social({
      provider: provider,
    });
  };

  return (
    <Button type="button" onClick={() => handleSignIn("discord")}>
      {loginString}
    </Button>
  );
}

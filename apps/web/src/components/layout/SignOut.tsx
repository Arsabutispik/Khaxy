"use client";

import { useRouter } from "next/navigation"; // 👈 Import useRouter
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function DiscordSignOutButton({
  logOutString,
}: {
  logOutString: string;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      className="w-full text-left"
      onClick={handleSignOut} // Simplified onClick handler
    >
      {logOutString}
    </button>
  );
}

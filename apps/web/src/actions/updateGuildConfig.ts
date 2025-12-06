"use server";

import { Guilds } from "@/types/types";

export async function updateConfig(
  guildId: string,
  data: Partial<Guilds>,
): Promise<Guilds> {
  const API_BASE_URL = process.env.FASTIFY_API_URL;
  const API_KEY = process.env.INTERNAL_API_KEY;
  const res = await fetch(`${API_BASE_URL}/api/guilds/${guildId}/settings`, {
    headers: {
      "x-internal-api-key": API_KEY || "",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data, (key, value) =>
      typeof value === "bigint" ? value.toString() : value,
    ),
  });
  if (!res.ok) {
    console.error("Failed to update guild config:", await res.text());
    throw new Error("Failed to update guild config");
  }

  return res.json();
}

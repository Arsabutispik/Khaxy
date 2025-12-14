"use server";

import { updateBotProfile } from "@/utils/utils";
import { revalidatePath } from "next/cache";

export type UpdateBotProfileResult = {
  success: boolean;
  error?: string;
  nickname?: string | null;
  avatar?: string | null;
};

export async function updateBotProfileAction(
  guildId: string,
  data: { nickname?: string | null; avatar?: string | null },
): Promise<UpdateBotProfileResult> {
  // Validate guildId format (Discord snowflake: 17-19 digits)
  if (!/^\d{17,19}$/.test(guildId)) {
    return { success: false, error: "Invalid guild ID format" };
  }

  // Validate nickname length if provided
  if (data.nickname !== undefined && data.nickname !== null) {
    if (data.nickname.length > 32) {
      return {
        success: false,
        error: "Nickname must be 32 characters or less",
      };
    }
    if (data.nickname.length < 1) {
      return { success: false, error: "Nickname must be at least 1 character" };
    }
  }

  try {
    const result = await updateBotProfile(guildId, data);

    if (!result) {
      return { success: false, error: "Failed to update bot profile" };
    }

    // Revalidate the dashboard home page to reflect changes
    revalidatePath(`/dashboard/${guildId}/home`);

    return {
      success: true,
      nickname: result.nickname,
      avatar: result.avatar,
    };
  } catch (err) {
    console.error("Error in updateBotProfileAction:", err);
    return { success: false, error: "An unexpected error occurred" };
  }
}

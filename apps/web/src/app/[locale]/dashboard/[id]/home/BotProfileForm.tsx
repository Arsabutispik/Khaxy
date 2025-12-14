"use client";

import React, { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, RotateCcw, Save, Loader2, Check, Trash2 } from "lucide-react";
import { updateBotProfileAction } from "@/actions/updateBotProfile";
import { useTranslations } from "next-intl";

interface BotProfileFormProps {
  guildId: string;
  initialNickname: string | null;
  initialAvatar: string | null;
  botUsername: string | null;
  botGlobalAvatar: string | null;
}

export function BotProfileForm({
  guildId,
  initialNickname,
  initialAvatar,
  botUsername,
  botGlobalAvatar,
}: BotProfileFormProps) {
  const t = useTranslations("BotProfileForm");

  // Track the "saved" state - this updates after successful save
  const [savedNickname, setSavedNickname] = useState(initialNickname ?? "");
  const [savedAvatar, setSavedAvatar] = useState<string | null>(initialAvatar);

  // Current form values
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatar ?? botGlobalAvatar,
  );
  const [avatarFile, setAvatarFile] = useState<string | null>(null);
  const [resetAvatarToDefault, setResetAvatarToDefault] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Track if there are unsaved changes (compare against saved state, not initial props)
  const hasNicknameChange = nickname !== savedNickname;
  const hasAvatarChange = avatarFile !== null || resetAvatarToDefault;
  const hasChanges = hasNicknameChange || hasAvatarChange;

  // Check if bot currently has a custom server avatar
  const hasCustomAvatar = savedAvatar !== null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * Compress and resize image to reduce payload size
   * Discord recommends 256x256 for avatars, we'll use 512x512 max for quality
   */
  const compressImage = (
    file: File,
    maxSize: number = 512,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with 0.9 quality for good balance of size/quality
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.9);
        resolve(compressedBase64);
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      // Load the file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error(t("validation.image_type"));
      return;
    }

    // Validate file size (max 8MB for Discord)
    if (file.size > 8 * 1024 * 1024) {
      toast.error(t("validation.image_size"));
      return;
    }

    try {
      // Compress and resize image to reduce payload size
      const compressedBase64 = await compressImage(file);
      setAvatarPreview(compressedBase64);
      setAvatarFile(compressedBase64);
      setResetAvatarToDefault(false); // Cancel any pending reset
    } catch {
      toast.error(t("validation.image_type"));
    }
  };

  const handleResetAvatar = () => {
    // Reset to the last saved avatar state
    setAvatarPreview(savedAvatar ?? botGlobalAvatar);
    setAvatarFile(null);
    setResetAvatarToDefault(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetToDefaultAvatar = () => {
    // Mark to reset avatar to bot's global avatar (remove custom server avatar)
    setAvatarPreview(botGlobalAvatar);
    setAvatarFile(null);
    setResetAvatarToDefault(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleResetNickname = () => {
    setNickname(savedNickname);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const updateData: { nickname?: string | null; avatar?: string | null } =
        {};

      // Only include fields that changed
      if (hasNicknameChange) {
        // Empty string means reset to bot username
        updateData.nickname = nickname.trim() === "" ? null : nickname.trim();
      }

      if (hasAvatarChange) {
        if (resetAvatarToDefault) {
          // Send null to reset avatar to default
          updateData.avatar = null;
        } else {
          updateData.avatar = avatarFile;
        }
      }

      const result = await updateBotProfileAction(guildId, updateData);

      if (result.success) {
        toast.success(t("success"));

        // Update saved state to reflect the new saved values
        if (hasNicknameChange) {
          setSavedNickname(nickname.trim() === "" ? "" : nickname.trim());
        }
        if (hasAvatarChange) {
          if (resetAvatarToDefault) {
            setSavedAvatar(null);
          } else if (avatarFile) {
            // The server returns the new avatar URL, use that or keep the preview
            setSavedAvatar(result.avatar ?? avatarFile);
            if (result.avatar) {
              setAvatarPreview(result.avatar);
            }
          }
        }

        // Reset change tracking
        setAvatarFile(null);
        setResetAvatarToDefault(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(result.error ?? t("error"));
      }
    } catch {
      toast.error(t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Display name: custom nickname or bot username
  const displayName = nickname.trim() || botUsername || "Bot";

  return (
    <Card className="bg-zinc-900/50 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">{t("card.title")}</CardTitle>
        <CardDescription>{t("card.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col gap-3">
            <Label className="text-sm text-zinc-300">
              {t("labels.avatar")}
            </Label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20 border-2 border-white/10">
                  <AvatarImage
                    src={avatarPreview ?? botGlobalAvatar ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback className="bg-zinc-800 text-white text-xl">
                    {displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                >
                  <Camera className="h-6 w-6 text-white" />
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAvatarClick}
                  className="text-xs"
                >
                  <Camera className="h-3 w-3 mr-1" />
                  {t("buttons.change_avatar")}
                </Button>
                {/* Show reset button if there are pending avatar changes */}
                {hasAvatarChange && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetAvatar}
                    className="text-xs text-zinc-400"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    {t("buttons.reset")}
                  </Button>
                )}
                {/* Show "Reset to Default" button if bot has custom avatar and not already resetting */}
                {hasCustomAvatar && !resetAvatarToDefault && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetToDefaultAvatar}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    {t("buttons.reset_to_default")}
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-zinc-500">{t("upload_avatar_hint")}</p>
          </div>

          {/* Nickname Section */}
          <div className="flex flex-col gap-3">
            <Label htmlFor="nickname" className="text-sm text-zinc-300">
              {t("labels.nickname")}
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="nickname"
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={botUsername ?? "Bot nickname"}
                maxLength={32}
                className="bg-zinc-800 border-white/10 text-white placeholder:text-zinc-500"
              />
              {hasNicknameChange && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleResetNickname}
                  className="text-zinc-400 hover:text-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-zinc-500">
              {t("change_nickname_hint", { length: nickname.length })}
            </p>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col gap-2 p-4 bg-zinc-800/50 rounded-lg border border-white/5">
            <p className="text-xs text-zinc-400 uppercase tracking-wider">
              {t("preview")}
            </p>
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarPreview ?? botGlobalAvatar ?? undefined}
                  alt={displayName}
                />
                <AvatarFallback className="bg-zinc-700 text-white">
                  {displayName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">{displayName}</span>
                <span className="bg-[#5865F2] text-white text-[10px] px-1.5 py-[1px] rounded-[4px] font-medium leading-none flex items-center h-[15px] mt-[1px]">
                  <Check className="w-[10px] h-[10px] mr-0.5" strokeWidth={4} />
                  <span className="translate-y-[0.5px]">{t("bot_badge")}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!hasChanges || isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("buttons.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {t("buttons.save")}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

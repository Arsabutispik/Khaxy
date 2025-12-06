"use client";

import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface VariableData {
  guildName: string;
  memberCount: number;
  username: string;
}

interface MessagePreviewProps {
  content: string;
  data: VariableData;
}

export function MessagePreview({ content, data }: MessagePreviewProps) {
  const [currentTime, setCurrentTime] = useState("Today at ...");
  const t = useTranslations("MessagePreview");
  // Set time on client-side to match user's locale
  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setCurrentTime(t("today_at", { time: timeString }));
  }, []);

  // Create the dynamic map based on props
  // We simulate that the user viewing this IS the new member
  const replacementMap: Record<string, string> = {
    "{user}": `@${data.username}`,
    "{name}": data.username,
    "{server}": data.guildName,
    "{memberCount}": data.memberCount.toString(),
    "{joinPosition}": data.memberCount.toString(), // Simulating they are the newest
    // We'll fake a creation date for the preview, or pass it in if you have it
    "{createdAt}": new Date().toLocaleDateString("en-GB"), // DD/MM/YYYY format
    "{createdAgo}": "just now",
  };

  // Regex to split by variables
  const parts = content.split(/(\{.*?\})/g);

  return (
    <div className="mt-4 border-t border-white/10 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <h4 className="text-xs font-bold text-zinc-500 uppercase mb-3 tracking-wider">
        {t("preview_title")}
      </h4>

      <div className="flex gap-4 group hover:bg-[#2e3035] -mx-2 p-2 rounded transition-colors">
        {/* Bot Avatar */}
        <div className="flex-shrink-0 cursor-pointer mt-0.5">
          <Image
            src="/logo.png"
            alt="Bot Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover hover:opacity-80 transition-opacity"
          />
        </div>

        <div className="flex flex-col min-w-0 w-full">
          {/* Header */}
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-white font-medium text-sm hover:underline cursor-pointer">
              Khaxy
            </span>
            <span className="bg-[#5865F2] text-white text-[10px] px-1.5 py-[1px] rounded-[4px] font-medium leading-none flex items-center h-[15px] mt-[1px]">
              <Check className="w-[10px] h-[10px] mr-0.5" strokeWidth={4} />
              <span className="translate-y-[0.5px]">{t("bot_badge")}</span>
            </span>
            {/* DYNAMIC TIME */}
            <span className="text-zinc-500 text-xs ml-1 font-medium">
              {currentTime}
            </span>
          </div>

          {/* Body */}
          <div className="text-[#dbdee1] text-sm leading-[1.375rem] whitespace-pre-wrap break-words font-light max-h-[150px] overflow-y-auto custom-scrollbar pr-2">
            {parts.map((part, i) => {
              const replacement = replacementMap[part];

              if (replacement) {
                const isMention = part === "{user}";
                return (
                  <span
                    key={i}
                    className={cn(
                      "rounded-[3px] px-0.5 transition-colors cursor-default",
                      isMention
                        ? "bg-[#5865F2]/30 text-[#c9cdfb] hover:bg-[#5865F2]/50 hover:text-white"
                        : "bg-white/10 text-white",
                    )}
                  >
                    {replacement}
                  </span>
                );
              }
              return <span key={i}>{part}</span>;
            })}
            {content.length === 0 && (
              <span className="text-zinc-600 italic text-xs select-none">
                Message content is empty...
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

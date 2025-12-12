"use client";

import React, { useState } from "react";
import { Hash, ChevronDown, Check, Search, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { APIChannel } from "discord-api-types/v10";
import { useTranslations } from "next-intl";

interface DiscordChannelSelectProps {
  label: string;
  value?: string;
  channels: APIChannel[];
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}

export function DiscordChannelSelect({
  label,
  value,
  channels,
  onChange,
  placeholder = "Select a channel",
}: DiscordChannelSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const t = useTranslations("DiscordChannelSelect");
  const selectedChannel = channels.find((c) => c.id === value);

  const filteredChannels = channels.filter((c) =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button
          className="group flex items-center justify-between md:justify-center w-full md:w-auto px-3 py-2.5 bg-black hover:bg-zinc-900 border border-white/10 rounded-md transition-all text-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label={label}
        >
          <span className="flex items-center gap-2 truncate mr-2">
            {selectedChannel ? (
              <>
                <Hash className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                <span className="font-medium truncate">
                  {selectedChannel.name}
                </span>
              </>
            ) : (
              <span className="text-zinc-500">{placeholder}</span>
            )}
          </span>

          <div className="flex items-center gap-1">
            {/* Clear Button - Only shows when channel is selected */}
            {selectedChannel && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation(); // Prevents dialog from opening
                  onChange(undefined);
                }}
                className="p-0.5 rounded-sm hover:bg-white/20 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </span>
            )}

            <ChevronDown className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors flex-shrink-0" />
          </div>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-black border border-white/10 text-gray-100 max-w-[440px] p-0 gap-0 shadow-2xl overflow-hidden">
        <DialogHeader className="p-4 pb-2 bg-black border-b border-white/5">
          <DialogTitle className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
            {label}
          </DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="p-3 bg-black">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search_channels")}
              className="w-full bg-zinc-900/50 text-gray-200 text-sm rounded-md px-2 py-2 pl-9 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-500 border border-transparent focus:border-blue-500/50"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-600" />
          </div>
        </div>

        {/* Channel List */}
        <div className="max-h-[350px] overflow-y-auto p-2 space-y-[2px] custom-scrollbar bg-black">
          {filteredChannels.length > 0 ? (
            filteredChannels.map((channel) => (
              <DialogClose asChild key={channel.id}>
                <button
                  onClick={() => {
                    onChange(channel.id);
                    setSearchQuery("");
                  }}
                  className={cn(
                    "w-full flex items-center px-3 py-2 rounded-sm group transition-all text-sm mb-0.5",
                    value === channel.id
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-gray-200",
                  )}
                >
                  <Hash
                    className={cn(
                      "w-5 h-5 mr-3 flex-shrink-0",
                      value === channel.id ? "text-white" : "text-zinc-600",
                    )}
                  />
                  <span className="font-medium flex-1 text-left truncate">
                    {channel.name || "Unnamed Channel"}
                  </span>
                  {value === channel.id && (
                    <Check className="w-4 h-4 text-white flex-shrink-0" />
                  )}
                </button>
              </DialogClose>
            ))
          ) : (
            <div className="text-center py-8 text-zinc-600 text-sm">
              No channels found
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

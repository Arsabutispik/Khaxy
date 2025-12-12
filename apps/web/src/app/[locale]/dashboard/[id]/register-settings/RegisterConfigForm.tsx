"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { DiscordChannelSelect } from "@/components/layout/DiscordChannelSelect";
import { APIChannel } from "discord-api-types/v10";
import { Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import UnsavedChanges from "@/components/layout/UnsavedChanges";
import MessageEditorModal from "@/components/layout/MessageEditorModal";
import Separator from "@/components/layout/Seperator";
import handleUnsavedChanges from "@/utils/HandleChangedSettings";

type RegisterConfig = {
  register_join_channel_id: string | null;
  register_channel_id: string | null;
  register_join_message: string | null;
};

interface RegisterConfigFormProps {
  initialConfig: RegisterConfig;
  guildId: string;
  channels: APIChannel[];
  guildName: string;
  memberCount: number;
  username: string;
}

// --- Main Component ---
export function RegisterConfigForm({
  initialConfig,
  guildId,
  channels,
  guildName,
  memberCount,
  username,
}: RegisterConfigFormProps) {
  const t = useTranslations("RegisterConfigForm");
  const { unsavedChanges, handleFieldChange, handleReset, formAction, config } =
    handleUnsavedChanges<RegisterConfig>({
      initialConfig,
      guildId,
      namespace: "RegisterConfigForm",
    });
  const fields: Array<{
    key: keyof RegisterConfig;
    title: string;
    description: string;
    type: "channel" | "message";
    label: string;
  }> = [
    {
      key: "register_join_channel_id",
      title: t("join.title"),
      description: t("join.description"),
      type: "channel",
      label: t("join.label"),
    },
    {
      key: "register_channel_id",
      title: t("register.title"),
      description: t("register.description"),
      type: "channel",
      label: t("register.label"),
    },
    {
      key: "register_join_message",
      title: t("message.title"),
      description: t("message.description"),
      type: "message",
      label: t("message.label"),
    },
  ];

  const previewData = { guildName, memberCount, username };
  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 p-6 w-full max-w-3xl mx-auto"
    >
      {unsavedChanges && (
        <UnsavedChanges
          handleReset={handleReset}
          unsavedChanges={unsavedChanges}
          message={{
            title: t("unsaved_alert.title"),
            reset: t("unsaved_alert.reset"),
          }}
        />
      )}

      <div className="flex flex-col gap-6">
        {fields.map((field, index) => (
          <React.Fragment key={field.key}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full gap-6">
              {/* Left: Text Content (Responsive Popover) */}
              <div className="flex items-center gap-2 min-w-0 w-full md:w-auto">
                <h3 className="text-base font-bold text-white truncate">
                  {field.title}
                </h3>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex-shrink-0 outline-none"
                    >
                      <Info className="w-4 h-4 text-zinc-500 hover:text-zinc-300 transition-colors" />
                      <span className="sr-only">Info</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent
                    align="start"
                    side="top"
                    className="w-auto bg-zinc-950 border border-white/10 text-zinc-300 text-xs p-3 shadow-xl z-50"
                  >
                    <p className="leading-relaxed">{field.description}</p>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Right: Dynamic Component */}
              <div className="w-full md:w-[320px] flex-shrink-0 flex justify-start md:justify-end">
                {field.type === "channel" && (
                  <DiscordChannelSelect
                    label={field.title}
                    channels={channels}
                    value={config[field.key] || undefined}
                    onChange={(val) =>
                      handleFieldChange(field.key, val || null)
                    }
                    placeholder="Select Channel"
                  />
                )}

                {field.type === "message" && (
                  <div className="flex justify-start md:justify-end w-full">
                    <MessageEditorModal
                      title={field.title}
                      value={config[field.key] || ""}
                      onChange={(val) => handleFieldChange(field.key, val)}
                      previewData={previewData}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Render Separator only if it's not the last item */}
            {index < fields.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </form>
  );
}

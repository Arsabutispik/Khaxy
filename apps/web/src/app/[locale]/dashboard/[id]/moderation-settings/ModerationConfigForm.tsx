"use client";

import React from "react";
import { useTranslations } from "next-intl";
import handleUnsavedChanges from "@/utils/HandleChangedSettings";
import UnsavedChanges from "@/components/layout/UnsavedChanges";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { DiscordChannelSelect } from "@/components/layout/DiscordChannelSelect";
import { DiscordRoleSelect } from "@/components/layout/DiscordRoleSelect";
import Separator from "@/components/layout/Seperator";
import { guilds as Guilds } from "@repo/database";
import { SafeChannel, SafeRole } from "@/types/types.js";
type ModerationConfig = Pick<
  Guilds,
  | "mod_logs_channel_id"
  | "staff_role_id"
  | "mod_mail_channel_id"
  | "mute_get_all_roles"
  | "days_to_kick"
  | "default_expiry"
>;

interface ModerationConfigFormProps {
  initialConfig: ModerationConfig;
  guildId: string;
  channels: SafeChannel[];
  roles: SafeRole[];
}

export function ModerationConfigForm({
  initialConfig,
  guildId,
  channels,
  roles,
}: ModerationConfigFormProps) {
  const t = useTranslations("ModerationConfigForm");
  const { unsavedChanges, config, handleFieldChange, handleReset, formAction } =
    handleUnsavedChanges<ModerationConfig>({
      initialConfig,
      guildId,
      namespace: "ModerationConfigForm",
    });
  const fields: Array<{
    key: keyof ModerationConfig;
    title: string;
    label: string;
    description: string;
    type: "channel" | "role" | "number" | "checkbox";
  }> = [
    {
      key: "mod_logs_channel_id",
      title: t("mod_logs_channel_id.title"),
      label: t("mod_logs_channel_id.label"),
      description: t("mod_logs_channel_id.description"),
      type: "channel",
    },
    {
      key: "staff_role_id",
      title: t("staff_role_id.title"),
      label: t("staff_role_id.label"),
      description: t("staff_role_id.description"),
      type: "role",
    },
    {
      key: "mod_mail_channel_id",
      title: t("mod_mail_channel_id.title"),
      label: t("mod_mail_channel_id.label"),
      description: t("mod_mail_channel_id.description"),
      type: "channel",
    },
    {
      key: "mute_get_all_roles",
      title: t("mute_get_all_roles.title"),
      label: t("mute_get_all_roles.label"),
      description: t("mute_get_all_roles.description"),
      type: "checkbox",
    },
    {
      key: "days_to_kick",
      title: t("days_to_kick.title"),
      label: t("days_to_kick.label"),
      description: t("days_to_kick.description"),
      type: "number",
    },
    {
      key: "default_expiry",
      title: t("default_expiry.title"),
      label: t("default_expiry.label"),
      description: t("default_expiry.description"),
      type: "number",
    },
  ];

  return (
    <form
      action={formAction}
      className={"flex flex-col gap-4 p-6 w-full max-w-3xl mx-auto pb-32"}
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
              {/* Left: Text Content */}
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
                    value={
                      (config[field.key] as unknown as string) || undefined
                    }
                    onChange={(val) => handleFieldChange(field.key, val as any)}
                    placeholder={t("select_channel")}
                  />
                )}
                {field.type === "number" && (
                  <input
                    type="number"
                    min={0}
                    className="w-full md:w-48 bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={
                      config[field.key] === null ||
                      config[field.key] === undefined
                        ? ""
                        : String(config[field.key])
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      let newValue: number | null = null;
                      if (value !== "") {
                        const parsed = parseInt(value, 10);
                        newValue = isNaN(parsed) ? null : parsed;
                      }
                      handleFieldChange(field.key, newValue);
                    }}
                    placeholder={t("number_placeholder") as string}
                  />
                )}
                {field.type === "checkbox" && (
                  <input
                    type="checkbox"
                    className="w-5 h-5 accent-blue-500"
                    checked={!!config[field.key]}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.checked)
                    }
                  />
                )}
                {field.type === "role" && (
                  <DiscordRoleSelect
                    label={field.title}
                    roles={roles}
                    value={
                      (config[field.key] as unknown as string) || undefined
                    }
                    onChange={(val) => handleFieldChange(field.key, val as any)}
                    placeholder={t("select_role")}
                  />
                )}
              </div>
            </div>
            {index < fields.length - 1 && <Separator />}
          </React.Fragment>
        ))}
      </div>
    </form>
  );
}

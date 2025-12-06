import React, { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VariableTextarea } from "@/components/layout/VariableTextarea";
import { MessagePreview } from "@/components/layout/MessagePreview";

export default function MessageEditorModal({
  title,
  value,
  onChange,
  previewData,
}: {
  title: string;
  value: string;
  onChange: (val: string) => void;
  previewData: { guildName: string; memberCount: number; username: string };
}) {
  const [localValue, setLocalValue] = useState(value);
  const t = useTranslations("RegisterConfigForm");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-auto px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-white text-sm font-medium rounded-md transition-colors">
          {t("edit_message")}
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black border border-white/10 text-gray-100 sm:max-w-lg p-0 gap-0 shadow-2xl">
        <DialogHeader className="p-6 pb-2 border-b border-white/5">
          <DialogTitle className="text-xl font-bold text-white">
            {t("edit_message_title", { title })}
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 pt-4 space-y-4">
          {/* REPLACED div/textarea with VariableTextarea */}
          <VariableTextarea
            value={localValue || ""}
            // The component handles the event or string correctly now
            onChange={(e) => {
              if (typeof e === "string") {
                setLocalValue(e);
              } else {
                setLocalValue(e.target.value);
              }
            }}
            rows={6}
            placeholder="Welcome {user} to {server}!"
          />
          <MessagePreview content={localValue || ""} data={previewData} />
          {/* Helper Text showing available variables (optional, good UX) */}
          <div className="text-[10px] text-zinc-500 flex flex-wrap gap-2">
            {t.rich("variable_tip", {
              // 'chunks' represents the content inside the tag (in this case, just "{")
              codeWrapper: (chunks) => (
                <code className="bg-white/10 px-1 rounded text-zinc-300 mx-1 font-mono">
                  {chunks}
                </code>
              ),
            })}
          </div>

          <div className="flex justify-between items-center text-xs font-medium">
            <span
              className={`${
                (localValue?.length || 0) > 1500
                  ? "text-red-400"
                  : "text-zinc-500"
              }`}
            >
              {localValue?.length || 0} / 1500
            </span>
            <DialogClose asChild>
              <button
                onClick={() => onChange(localValue)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors"
              >
                {t("save_message")}
              </button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// utils/HandleChangedSettings.ts
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { updateConfig } from "@/actions/updateGuildConfig";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // 1. Import useRouter

export default function handleUnsavedChanges<T extends Record<string, any>>({
  initialConfig,
  guildId,
  namespace,
}: {
  initialConfig: T;
  guildId: string;
  namespace: string;
}) {
  const [config, setConfig] = useState<T>(initialConfig);
  const [savedConfig, setSavedConfig] = useState<T>(initialConfig);
  const router = useRouter();
  const t = useTranslations(namespace);

  const unsavedChanges = JSON.stringify(config) !== JSON.stringify(savedConfig);

  useEffect(() => {
    setConfig(initialConfig);
    setSavedConfig(initialConfig);
  }, [initialConfig]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (unsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [unsavedChanges]);

  const handleFieldChange = <K extends keyof T>(key: K, value: T[K]) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setConfig(savedConfig);
  };

  const formAction = async () => {
    if (!unsavedChanges) return;

    try {
      // @ts-ignore
      await updateConfig(guildId, config);

      toast.success(t("save_success"));

      router.refresh();

      setSavedConfig(config);
    } catch (error) {
      toast.error(t("save_error"));
      console.error("Failed to save config:", error);
    }
  };

  return { unsavedChanges, handleFieldChange, handleReset, formAction, config };
}

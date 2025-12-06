"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export function SaveButton({
  disabled,
  unsavedChanges,
}: {
  disabled: boolean;
  unsavedChanges: boolean;
}) {
  const { pending } = useFormStatus();
  const t = useTranslations("RegisterConfigForm");

  const isDisabled = disabled || !unsavedChanges || pending;

  const buttonText = pending ? t("saving") : t("save");

  return (
    <Button type="submit" disabled={isDisabled} className="px-6 py-2">
      {buttonText}
    </Button>
  );
}

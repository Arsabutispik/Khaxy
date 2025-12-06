// src/components/LocaleSwitcher.tsx
"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlagIcon, FlagIconCode } from "react-flag-kit";

const availableLocales: { code: string; name: string; flag: FlagIconCode }[] = [
  {
    code: "en",
    name: "English",
    flag: "GB",
  },
  {
    code: "tr",
    name: "Türkçe",
    flag: "TR",
  },
];

export default function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const onSelectChange = (value: string) => {
    const newPath = pathname.startsWith(`/${locale}`)
      ? pathname.substring(locale.length + 1)
      : pathname;
    startTransition(() => {
      router.replace(`/${value}${newPath}`);
    });
  };
  return (
    <Select
      defaultValue={locale}
      onValueChange={onSelectChange}
      disabled={isPending}
    >
      {/* ✅ FIX: Remove the manual Flag component from the trigger */}
      <SelectTrigger className="w-auto gap-2">
        <SelectValue placeholder="Language" />
      </SelectTrigger>
      <SelectContent>
        {availableLocales.map((loc) => (
          <SelectItem key={loc.code} value={loc.code}>
            <div className="flex items-center gap-2">
              <FlagIcon code={loc.flag} size={20} />
              <span>{loc.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

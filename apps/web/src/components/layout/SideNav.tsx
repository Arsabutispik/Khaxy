"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Define the structure of the category objects from your Discord command
interface Category {
  name: string;
  value: string; // The URL tab parameter value (e.g., 'register')
  i18nKey: string; // Key for next-intl translation (e.g., 'registerSettings')
}

interface SideNavProps {
  categories: Category[];
  guildId: string;
}

export function SideNav({ categories }: SideNavProps) {
  const t = useTranslations("Dashboard");
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get the current active tab from the URL query, defaulting to 'register'
  const activeTabValue = searchParams.get("tab") || "register";

  const handleNavigate = (tabValue: string) => {
    // Create new URLSearchParams object
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabValue);

    // Navigate to the current path with the new query parameter
    // pathname will be /en/dashboard/12345
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <nav className="flex flex-col space-y-2 p-4 bg-muted/30 rounded-lg">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">
        {t("settings_menu_title")}
      </h3>
      {categories.map((category) => (
        <Button
          key={category.value}
          onClick={() => handleNavigate(category.value)}
          className={`justify-start w-full ${
            activeTabValue === category.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          }`}
          variant="ghost"
        >
          {/* Translate the name using the i18nKey */}
          {t(`settings_category.${category.i18nKey}`)}
        </Button>
      ))}
    </nav>
  );
}

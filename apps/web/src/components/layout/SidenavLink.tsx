// src/components/layout/SidenavLink.tsx
"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import React from "react";

// 1. IMPORT ALL NECESSARY ICONS HERE (THE CLIENT COMPONENT)
import { Home, ClipboardCheck, Inbox, Calendar } from "lucide-react";

// 2. CREATE A MAP OF ICON NAMES TO ICON COMPONENTS
const iconMap = {
  Home,
  ClipboardCheck,
  Inbox,
  Calendar,
};

export function SidenavLink({
  href,
  iconName,
  title,
}: {
  href: string;
  iconName: keyof typeof iconMap;
  title: string;
}) {
  const pathname = usePathname();

  // 3. RETRIEVE THE ICON COMPONENT from the map using the string name
  const Icon = iconMap[iconName];

  // You can keep your existing path logic
  const isCurrent = pathname.endsWith(href);

  // If the icon is missing from the map, return early or use a fallback
  if (!Icon) return null;

  return (
    <Link href={href} passHref legacyBehavior>
      <SidebarMenuButton asChild isActive={isCurrent}>
        <a>
          {/* 4. RENDER THE ICON COMPONENT */}
          <Icon />
          <span>{title}</span>
        </a>
      </SidebarMenuButton>
    </Link>
  );
}

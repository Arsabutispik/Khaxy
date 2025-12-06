import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { SidenavLink } from "@/components/layout/SidenavLink";
import { useTranslations } from "next-intl";
import React from "react";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("AppSidebar");
  const items: {
    title: string;
    url: string;
    iconName: "Home" | "ClipboardCheck" | "Inbox" | "Calendar";
  }[] = [
    {
      title: t("register_settings"),
      url: "register-settings",
      iconName: "ClipboardCheck",
    },
    {
      title: t("moderation_settings"),
      url: "moderation-settings",
      iconName: "Inbox",
    },
  ];
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem key="Home">
                <SidenavLink href="home" iconName="Home" title={t("home")} />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("settings")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidenavLink
                    href={item.url}
                    iconName={item.iconName}
                    title={item.title}
                  />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

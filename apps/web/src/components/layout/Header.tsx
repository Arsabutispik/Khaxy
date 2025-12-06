// src/components/layout/Header.tsx
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ModeToggle } from "@/components/ui/theme-switcher";
import { UserNav } from "./UserNav";
import MobileNav from "./MobileNav";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { useTranslations } from "next-intl";

export default function Header() {
  const t = useTranslations("Header");
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Use a 3-column grid for a robust and predictable layout */}
      <div className="container grid h-16 grid-cols-3 items-center gap-x-2 px-4">
        {/* START SLOT: Contains mobile nav and desktop brand */}
        <div className="justify-self-start">
          <div className="md:hidden">
            <MobileNav />
          </div>
          <Link href="/" className="hidden items-center gap-2 md:flex">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="rounded-full"
            />
            <span className="font-bold">Khaxy</span>
          </Link>
        </div>

        {/* CENTER SLOT: Contains mobile brand and desktop navigation */}
        <div className="justify-self-center">
          {/* Mobile Brand */}
          <Link
            href="/"
            className="flex items-center gap-2 md:hidden sm:hidden xs:hidden"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-bold">Khaxy</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link
                  href="/dashboard"
                  className={navigationMenuTriggerStyle()}
                >
                  {t("dashboard")}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/support" className={navigationMenuTriggerStyle()}>
                  {t("support")}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/invite" className={navigationMenuTriggerStyle()}>
                  {t("invite")}
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* END SLOT: Contains user controls */}
        <div className="flex items-center justify-self-end gap-1 md:gap-4">
          <div className="hidden md:flex items-center gap-2">
            <LocaleSwitcher />
            <ModeToggle />
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
}

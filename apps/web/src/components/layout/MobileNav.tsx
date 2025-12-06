"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AnimatedHamburgerIcon } from "./AnimatedHamburgerIcon";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { LayoutDashboard, LifeBuoy, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import LocaleSwitcher from "@/components/layout/LocaleSwitcher";
import { ModeToggle } from "@/components/ui/theme-switcher";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations("Header");

  // Swipe config
  const swipeConfig = {
    delta: 5,
    trackTouch: true,
    preventScrollOnSwipe: false,
  };

  const closeHandlers = useSwipeable({
    onSwipedLeft: () => setIsOpen(false),
    ...swipeConfig,
  });

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Navigation Menu"
          >
            <AnimatedHamburgerIcon isOpen={isOpen} />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="left"
          className="w-[85vw] max-w-[300px] bg-background p-6"
          {...closeHandlers}
        >
          <SheetHeader>
            <SheetTitle className="sr-only">Main Menu</SheetTitle>
          </SheetHeader>

          <nav className="flex flex-col gap-4 pt-4 text-lg font-medium">
            <Link
              href="/"
              className="flex items-center gap-2 border-b pb-4 mb-4"
              onClick={() => setIsOpen(false)}
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

            <Link
              href="/dashboard"
              className="flex items-center gap-4 p-2 rounded-md transition-colors duration-200 hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>{t("dashboard")}</span>
            </Link>

            <Link
              href="/support"
              className="flex items-center gap-4 p-2 rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <LifeBuoy className="h-5 w-5" />
              <span>{t("support")}</span>
            </Link>

            <Link
              href="/invite"
              className="flex items-center gap-4 p-2 rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent"
              onClick={() => setIsOpen(false)}
            >
              <UserPlus className="h-5 w-5" />
              <span>{t("invite")}</span>
            </Link>

            <div className="flex flex-nowrap gap-1">
              <LocaleSwitcher />
              <ModeToggle />
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

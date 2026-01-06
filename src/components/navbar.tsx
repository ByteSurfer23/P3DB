"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

export function Navbar() {
  const router = useRouter();
  // Using a state variable to handle mobile menu open/close
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-extrabold text-2xl tracking-tight text-primary">
           <img
      src="https://res.cloudinary.com/ddljq4uyx/image/upload/v1758388257/vitlogo-freelogovectors.net__coyazr.png"
      alt="Logo"
      className="w-24 h-24 object-contain"
    />
        </Link>
        <div><p className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-4 text-primary">Pan-PhytoDB</p></div>
        {/* Desktop Menu */}
        <NavigationMenu className="hidden md:flex flex-1 justify-end items-center space-x-4">
          <NavigationMenuList className="flex items-center gap-2">
            <NavigationMenuItem>
              <ModeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          {/* <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between">
              
            </SheetContent>
          </Sheet> */}
        </div>
      </div>
    </header>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User, LogIn, UserPlus } from "lucide-react";
import { ModeToggle } from "./mode-toggle";

// Assume this is your authentication context hook
// You will need to import and use your actual context here
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
  // Using a state variable to handle mobile menu open/close
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, signOut } = useAuth(); // Get user and signOut function from your context

  const handleSignOut = async () => {
    try {
      await signOut(); // Call the signOut function from your auth context
      router.push("/signin"); // Redirect to the sign-in page after logging out
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="font-extrabold text-2xl tracking-tight text-primary">
          PhytoDB
        </Link>

        {/* Desktop Menu */}
        <NavigationMenu className="hidden md:flex flex-1 justify-end items-center space-x-4">
          <NavigationMenuList className="flex items-center gap-2">
            {user ? (
              // If user is logged in, show "Sign Out" button
              <NavigationMenuItem>
                <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors duration-200">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </NavigationMenuItem>
            ) : (
              // If no user, show "Sign In" and "Sign Up"
              <>
                <NavigationMenuItem>
                  <Link href="/signin">
                    <Button variant="ghost" className="flex items-center gap-2 text-primary border border-border hover:bg-muted transition-colors duration-200">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/signup">
                    <Button className="flex items-center gap-2 transition-colors duration-200">
                      <UserPlus className="h-4 w-4" />
                      Sign Up
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
            <NavigationMenuItem>
              <ModeToggle />
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Menu */}
        <div className="flex items-center gap-2 md:hidden">
          <ModeToggle />
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6 text-primary" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex flex-col justify-between">
              <div className="flex flex-col space-y-4 mt-8">
                {user ? (
                  <Button variant="ghost" onClick={() => { handleSignOut(); setIsSheetOpen(false); }} className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-600 transition-colors duration-200">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" className="w-full justify-start text-primary border border-border hover:bg-muted transition-colors duration-200" onClick={() => setIsSheetOpen(false)}>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full justify-start transition-colors duration-200" onClick={() => setIsSheetOpen(false)}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

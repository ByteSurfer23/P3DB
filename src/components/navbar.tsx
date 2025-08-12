"use client";

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

// Assume this is your authentication context hook
// You will need to import and use your actual context here
import { useAuth } from "@/context/AuthContext";

export function Navbar() {
  const router = useRouter();
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
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg">
          MyApp
        </Link>

        {/* Desktop Menu */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {user ? (
              // If user is logged in, show "Sign Out" button
              <NavigationMenuItem>
                <Button variant="ghost" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </NavigationMenuItem>
            ) : (
              // If no user, show "Sign In" and "Sign Up"
              <>
                <NavigationMenuItem>
                  <Link href="/signin">
                    <Button variant="ghost">Sign In</Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link href="/signup">
                    <Button>Sign Up</Button>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Actions and Mobile Menu */}
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-4">
                {user ? (
                  <Button variant="ghost" onClick={handleSignOut} className="w-full">
                    Sign Out
                  </Button>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign Up</Button>
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
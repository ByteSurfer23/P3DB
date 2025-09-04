export const dynamic = "force-dynamic";
import "./globals.css";

import { ThemeProvider } from "@/providers/theme-provider";
import { Navbar } from "@/components/navbar";
import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <AuthProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          {children}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

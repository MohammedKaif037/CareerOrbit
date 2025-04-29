import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/lib/auth-context"; //Adjust if path differs


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Career Orbit | Job Application Tracker",
  description: "Track your job applications with a cosmic-themed interface",
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <AuthProvider> {/* ✅ Wrap everything here */}
            <SidebarProvider>
              <div className="flex min-h-screen">
                <AppSidebar />
                <main className="flex-1 bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
                  <div className="absolute inset-0 z-0">
                    <StarField />
                  </div>
                  <div className="relative z-10 h-full">{children}</div>
                </main>
              </div>
            </SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


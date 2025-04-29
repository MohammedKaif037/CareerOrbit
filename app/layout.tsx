import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/lib/auth-context';

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Career Orbit | Job Application Tracker",
  description: "Track your job applications with a cosmic-themed interface",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <AuthProvider>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
      </body>
      </AuthProvider>
    </html>
  )
}

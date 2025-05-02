import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from '@/lib/auth-context'
import AuthenticatedLayout from "./authenticated-layout"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Career Orbit | Job Application Tracker",
  description: "Track your job applications with a cosmic-themed interface",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <AuthenticatedLayout>
              {children}
            </AuthenticatedLayout>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

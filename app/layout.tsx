import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
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
    <AuthProvider>
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
    </AuthProvider>
  )
}

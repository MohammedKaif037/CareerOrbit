"use client"

import {
  BarChart3,
  Home,
  ListChecks,
  PlusCircle,
  Calendar,
  Settings,
  LogOut,
  Rocket,
  Table2,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    async function getUser() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()
  }, [])

  const menuItems = [
    { title: "Dashboard", icon: Home, href: "/dashboard" },
    { title: "Applications", icon: ListChecks, href: "/applications" },
    { title: "Your Applications", icon: Table2, href: "/your-applications" },
    { title: "Add Application", icon: PlusCircle, href: "/applications/new" },
    { title: "Interviews", icon: Calendar, href: "/interviews" },
    { title: "Analytics", icon: BarChart3, href: "/analytics" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ]

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = "/login"
    } catch (error) {
      console.error("Sign out error:", error)
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-background/80 border border-white/10 backdrop-blur text-white"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <div
        className={`fixed z-40 h-full transition-transform duration-300 bg-background md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:w-[260px] w-[80%] border-r border-white/10`}
      >
        <Sidebar>
          <SidebarHeader className="flex items-center justify-center py-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Rocket className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Career Orbit</span>
            </Link>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={item.title}>
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button className="w-full" onClick={handleSignOut}>
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {user && (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  Signed in as: {user.email}
                </div>
              )}
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>
    </>
  )
}

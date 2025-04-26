"use client"

import { BarChart3, Home, ListChecks, PlusCircle, Calendar, Settings, LogOut, Rocket, Table2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth-context"

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
  const { signOut, user } = useAuth()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/dashboard",
    },
    {
      title: "Applications",
      icon: ListChecks,
      href: "/applications",
    },
    {
      title: "Your Applications",
      icon: Table2,
      href: "/your-applications",
    },
    {
      title: "Add Application",
      icon: PlusCircle,
      href: "/applications/new",
    },
    {
      title: "Interviews",
      icon: Calendar,
      href: "/interviews",
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/analytics",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ]

  return (
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
              <button className="w-full" onClick={() => signOut()}>
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {user && <div className="px-3 py-2 text-xs text-muted-foreground">Signed in as: {user.email}</div>}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

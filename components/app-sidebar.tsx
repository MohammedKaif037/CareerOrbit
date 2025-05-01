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
  const [user, setUser] = useState(null)
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

  // Close sidebar when clicking a link on mobile
  const handleMobileNavigation = () => {
    if (window.innerWidth < 768) {
      setIsOpen(false)
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

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 bg-background md:translate-x-0 md:static ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } border-r border-white/10`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-center py-6">
            <Link href="/dashboard" className="flex items-center gap-2" onClick={handleMobileNavigation}>
              <Rocket className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Career Orbit</span>
            </Link>
          </div>
          
          <div className="border-t border-white/10" />
          
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    onClick={handleMobileNavigation}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/10 transition-colors ${
                      pathname === item.href ? "bg-white/10 text-primary" : "text-foreground"
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          <div className="border-t border-white/10 mt-auto" />
          
          <div className="p-4">
            <button 
              className="flex items-center gap-3 w-full px-3 py-2 rounded-md hover:bg-white/10 transition-colors"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
            
            {user && (
              <div className="px-3 py-2 mt-2 text-xs text-muted-foreground">
                Signed in as: {user.email}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

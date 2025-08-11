"use client"

import { BarChart3, Building2, LayoutDashboard, Shield, Users, User, Home, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar"

interface UserData {
  userType: string
  name: string
  email: string
}

const adminItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Facility Approval",
    url: "/facility-approval",
    icon: Building2,
  },
  {
    title: "User Management",
    url: "/user-management",
    icon: Users,
  },
  {
    title: "Reports & Moderation",
    url: "/reports",
    icon: Shield,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

const facilityOwnerItems = [
  {
    title: "Dashboard",
    url: "/facility-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Facilities",
    url: "/my-facilities",
    icon: Building2,
  },
  {
    title: "Facility Management",
    url: "/facility-management",
    icon: Building2,
  },
  {
    title: "Court Management",
    url: "/court-management",
    icon: Calendar,
  },
  {
    title: "Time Slot Management",
    url: "/time-slot-management",
    icon: Clock,
  },
  {
    title: "Booking Overview",
    url: "/booking-overview",
    icon: Calendar,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

const userItems = [
  {
    title: "Home",
    url: "/user-home",
    icon: Home,
  },
  {
    title: "Venues",
    url: "/venues",
    icon: Building2,
  },
  {
    title: "My Bookings",
    url: "/my-bookings",
    icon: Calendar,
  },
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [items, setItems] = useState(adminItems)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserData(parsedUser)

      switch (parsedUser.userType) {
        case "admin":
          setItems(adminItems)
          break
        case "facility-owner":
          setItems(facilityOwnerItems)
          break
        case "user":
          setItems(userItems)
          break
        default:
          setItems(adminItems)
      }
    }
  }, [])

  const getSidebarTitle = () => {
    if (!userData) return "QuickCourt Admin"

    switch (userData.userType) {
      case "admin":
        return "QuickCourt Admin"
      case "facility-owner":
        return "Facility Owner"
      case "user":
        return "QuickCourt"
      default:
        return "QuickCourt"
    }
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-4 py-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">{getSidebarTitle()}</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

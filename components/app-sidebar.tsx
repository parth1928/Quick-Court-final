"use client"

import { BarChart3, Building2, LayoutDashboard, Users, User, Home, Calendar, Clock, Trophy, Award, Shield, Gamepad2, Dices } from "lucide-react"
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
  role: string
  name: string
  email: string
}

const adminItems = [
  { title: 'Dashboard', url: '/admin-dashboard', icon: LayoutDashboard },
  { title: 'Facility Approval', url: '/facility-approval', icon: Building2 },
  { title: 'Venue Approval', url: '/venue-approval', icon: Building2 },
  { title: 'User Management', url: '/user-management', icon: Users },
  { title: 'Reports / Moderation', url: '/reports', icon: Shield },
  { title: 'Profile', url: '/profile', icon: User },
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
    title: "Tournament Hosting",
    url: "/tournament-hosting",
    icon: Trophy,
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
    title: "Games",
    url: "/games",
    icon: Dices,
  },
  {
    title: "Matches",
    url: "/matches",
    icon: Gamepad2,
  },
  {
    title: "My Bookings",
    url: "/my-bookings",
    icon: Calendar,
  },
  {
    title: "Tournaments",
    url: "/tournaments",
    icon: Trophy,
  },
  {
    title: "My Tournaments",
    url: "/my-tournaments",
    icon: Award,
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
  const [items, setItems] = useState(userItems)

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (user) {
      const parsedUser = JSON.parse(user)
      setUserData(parsedUser)

      switch (parsedUser.role) {
        case 'admin':
          setItems(adminItems)
          break
        case 'owner':
          setItems(facilityOwnerItems)
          break
        case 'user':
        default:
          setItems(userItems)
      }
    }
  }, [])

  const getSidebarTitle = () => {
    if (!userData) return "QuickCourt"
    switch (userData.role) {
      case 'admin':
        return 'Admin'
      case 'owner':
        return 'Facility Owner'
      default:
        return 'QuickCourt'
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
              {items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <IconComponent />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

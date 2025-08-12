"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarTrigger } from "@/components/ui/sidebar"
import Notifications from "@/components/notifications"

interface UserData {
  name: string
  email: string
  role: string
}

export function Header() {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const user = localStorage.getItem("user")
    const authToken = localStorage.getItem("token") || localStorage.getItem("authToken")
    if (user) {
      setUserData(JSON.parse(user))
    }
    if (authToken) {
      setToken(authToken)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("authToken")
    router.push("/login")
  }

  const getDisplayTitle = () => {
    if (!userData) return 'QuickCourt'
    switch (userData.role) {
      case 'admin': return 'Admin Dashboard'
      case 'owner': return 'Facility Owner Dashboard'
      default: return 'QuickCourt'
    }
  }

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <h1 className="text-xl font-semibold text-gray-900">{getDisplayTitle()}</h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Notifications token={token ?? undefined} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userData?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{userData?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

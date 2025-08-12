"use client"

import type React from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import { BanCheckProvider } from "@/hooks/use-ban-check"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Pages that don't need the admin layout or ban checking
  const publicPages = ["/", "/login", "/signup", "/forgot-password", "/welcome", "/banned"]
  const isPublicPage = publicPages.includes(pathname)

  if (isPublicPage) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <BanCheckProvider>
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </div>
        <Toaster />
      </SidebarProvider>
    </BanCheckProvider>
  )
}

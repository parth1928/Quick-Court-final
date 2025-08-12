import { ReactNode } from 'react'

interface VenueManagementLayoutProps {
  children: ReactNode
  params: {
    id: string
  }
}

export default function VenueManagementLayout({
  children,
  params
}: VenueManagementLayoutProps) {
  return (
    <div className="venue-management-layout">
      {children}
    </div>
  )
}
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Mail, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BannedPage() {
  const router = useRouter()

  const handleLogout = () => {
    // Clear auth token
    document.cookie = 'authToken=; Max-Age=0; path=/'
    router.push('/login')
  }

  const handleContact = () => {
    window.location.href = 'mailto:support@quickcourt.com?subject=Account Ban Appeal'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-red-800">Account Suspended</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-gray-600">
            <p className="mb-4">
              Your account has been suspended and you cannot access Quick Court services at this time.
            </p>
            <p className="text-sm">
              If you believe this is an error or would like to appeal this decision, please contact our support team.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={handleContact}
              className="w-full"
              variant="outline"
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            
            <Button 
              onClick={handleLogout}
              className="w-full"
              variant="destructive"
            >
              Sign Out
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center mt-6">
            <p>Support: support@quickcourt.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

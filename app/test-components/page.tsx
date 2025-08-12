"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Building2, Calendar, Activity, TrendingUp, DollarSign } from 'lucide-react'

export default function ComponentTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Component Test Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Users className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm">Users Icon</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Building2 className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm">Building2 Icon</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Calendar className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm">Calendar Icon</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <Activity className="h-8 w-8 mb-2 text-red-600" />
              <span className="text-sm">Activity Icon</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mb-2 text-orange-600" />
              <span className="text-sm">TrendingUp Icon</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg">
              <DollarSign className="h-8 w-8 mb-2 text-yellow-600" />
              <span className="text-sm">DollarSign Icon</span>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Component Status:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Badge variant="default" className="p-2 justify-center">
                ✅ All Lucide Icons Working
              </Badge>
              <Badge variant="default" className="p-2 justify-center">
                ✅ Card Components Working
              </Badge>
              <Badge variant="default" className="p-2 justify-center">
                ✅ Button Components Working
              </Badge>
              <Badge variant="default" className="p-2 justify-center">
                ✅ Badge Components Working
              </Badge>
            </div>
          </div>

          <div className="mt-8">
            <Button className="w-full">
              ✅ All Components Test Passed
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"

export default function PaymentTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Simulator Test</h1>
          <p className="text-gray-600">Test the payment flow for both venues and tournaments</p>
        </div>

        <div className="space-y-6">
          {/* Venue Booking Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test Venue Booking Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Venue: Elite Sports Complex</p>
                <p>Court: Basketball Court A</p>
                <p>Date: {new Date().toLocaleDateString()}</p>
                <p>Time: 4:00 PM - 5:00 PM</p>
                <p>Amount: ₹1,500</p>
              </div>
              <PaySimulator
                amount={1500}
                descriptor="Venue Booking - Basketball Court A"
                buttonLabel="Book & Pay Now"
                onSuccess={(tx) => {
                  console.log("Venue booking successful:", tx)
                  
                  toast({
                    title: "Booking Confirmed!",
                    description: "Redirecting to confirmation page...",
                  })
                  
                  const queryParams = new URLSearchParams({
                    txId: tx.id,
                    amount: "1500",
                    type: "venue",
                    venue: "Elite Sports Complex",
                    court: "Basketball Court A",
                    date: new Date().toLocaleDateString(),
                    timeSlots: "4:00 PM - 5:00 PM"
                  })
                  
                  setTimeout(() => {
                    window.location.href = `/payment-completed?${queryParams.toString()}`
                  }, 1000)
                }}
                onFailure={() => {
                  toast({
                    title: "Payment Failed",
                    description: "Please try again or use a different payment method",
                    variant: "destructive",
                  })
                }}
              />
            </CardContent>
          </Card>

          {/* Tournament Registration Test */}
          <Card>
            <CardHeader>
              <CardTitle>Test Tournament Registration Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Tournament: Mumbai Basketball Premier League</p>
                <p>Sport: Basketball</p>
                <p>Category: 5v5</p>
                <p>Entry Fee: ₹5,000</p>
                <p>Start Date: September 10, 2024</p>
              </div>
              <PaySimulator
                amount={5000}
                descriptor="Tournament Registration - Mumbai Basketball Premier League"
                buttonLabel="Register & Pay"
                onSuccess={(tx) => {
                  console.log("Tournament registration successful:", tx)
                  
                  toast({
                    title: "Registration Successful!",
                    description: "Redirecting to confirmation page...",
                  })
                  
                  const queryParams = new URLSearchParams({
                    txId: tx.id,
                    amount: "5000",
                    type: "tournament",
                    tournament: "Mumbai Basketball Premier League",
                    venue: "NSCI Indoor Stadium",
                    date: new Date().toLocaleDateString()
                  })
                  
                  setTimeout(() => {
                    window.location.href = `/payment-completed?${queryParams.toString()}`
                  }, 1000)
                }}
                onFailure={() => {
                  toast({
                    title: "Registration Failed",
                    description: "Please try again or use a different payment method",
                    variant: "destructive",
                  })
                }}
              />
            </CardContent>
          </Card>

          {/* Direct Link Test */}
          <Card>
            <CardHeader>
              <CardTitle>Direct Link Test</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Test the payment completion page directly with sample data
              </p>
              <div className="flex gap-2">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/payment-completed?txId=TEST_TXN_VENUE&amount=1500&type=venue&venue=Elite Sports Complex">
                    Test Venue Success
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/payment-completed?txId=TEST_TXN_TOURNAMENT&amount=5000&type=tournament&tournament=Test Tournament">
                    Test Tournament Success
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="text-center">
            <Button asChild variant="ghost">
              <Link href="/user-home">
                ← Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

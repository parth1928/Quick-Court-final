"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { formatInr } from "@/lib/format"

interface PaymentTransaction {
  id: string
  amount: number
  status: "success" | "failed"
  timestamp: Date
  method: string
  descriptor: string
}

interface PaySimulatorProps {
  amount: number
  descriptor: string
  buttonLabel?: string
  disabled?: boolean
  onSuccess: (transaction: PaymentTransaction) => void
  onFailure: () => void
}

export default function PaySimulator({
  amount,
  descriptor,
  buttonLabel = "Pay Now",
  disabled = false,
  onSuccess,
  onFailure,
}: PaySimulatorProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("")
  const [cardNumber, setCardNumber] = useState("")
  const [expiryDate, setExpiryDate] = useState("")
  const [cvv, setCvv] = useState("")
  const [cardholderName, setCardholderName] = useState("")

  const simulatePayment = async () => {
    setIsProcessing(true)
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 90% success rate for simulation
    const isSuccess = Math.random() > 0.1
    
    if (isSuccess) {
      const transaction: PaymentTransaction = {
        id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        amount,
        status: "success",
        timestamp: new Date(),
        method: paymentMethod || "Credit Card",
        descriptor,
      }
      onSuccess(transaction)
    } else {
      onFailure()
    }
    
    setIsProcessing(false)
    setShowPaymentForm(false)
  }

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentMethod) return
    simulatePayment()
  }

  if (!showPaymentForm) {
    return (
      <Button
        onClick={() => setShowPaymentForm(true)}
        className="w-full"
        size="lg"
        disabled={isProcessing || disabled}
      >
        <CreditCard className="h-4 w-4 mr-2" />
        {buttonLabel}
      </Button>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Payment Simulator</span>
          <Badge variant="outline" className="text-xs">DEMO MODE</Badge>
        </CardTitle>
        <div className="text-sm text-gray-600">
          <p>{descriptor}</p>
          <p className="font-semibold text-lg text-blue-600">{formatInr(amount)}</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div>
            <Label htmlFor="payment-method">Payment Method</Label>
            <Select onValueChange={setPaymentMethod} required>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="debit-card">Debit Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="net-banking">Net Banking</SelectItem>
                <SelectItem value="wallet">Digital Wallet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(paymentMethod === "credit-card" || paymentMethod === "debit-card") && (
            <>
              <div>
                <Label htmlFor="cardholder-name">Cardholder Name</Label>
                <Input
                  id="cardholder-name"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    type="password"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {paymentMethod === "upi" && (
            <div>
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                placeholder="yourname@paytm"
                required
              />
            </div>
          )}

          {paymentMethod === "net-banking" && (
            <div>
              <Label htmlFor="bank">Select Bank</Label>
              <Select required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbi">State Bank of India</SelectItem>
                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                  <SelectItem value="icici">ICICI Bank</SelectItem>
                  <SelectItem value="axis">Axis Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPaymentForm(false)}
              className="flex-1"
              disabled={isProcessing || disabled}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isProcessing || disabled || !paymentMethod}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatInr(amount)}
                </>
              )}
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            <p>🔒 This is a payment simulator for demo purposes</p>
            <p>90% success rate • No real money will be charged</p>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

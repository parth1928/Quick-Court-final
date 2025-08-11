// components/pay-simulator.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"

type Props = {
  amount: number // in your currency’s base unit, e.g. INR rupees
  descriptor?: string // e.g. "Tournament Entry"
  onSuccess?: (tx: {
    id: string
    amount: number
    method: string
    status: "success"
    createdAt: string
  }) => void
  onFailure?: (reason: string) => void
  buttonLabel?: string
}

export default function PaySimulator({
  amount,
  descriptor = "Test Payment",
  onSuccess,
  onFailure,
  buttonLabel = "Pay (Simulated)",
}: Props) {
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState("upi")
  const [name, setName] = useState("")
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pay = async () => {
    setError(null)
    setProcessing(true)

    // tiny fake delay to feel real
    await new Promise((r) => setTimeout(r, 1400))

    // 90% success, 10% fail to test both paths
    const ok = Math.random() > 0.1
    setProcessing(false)

    if (!ok) {
      setError("Payment failed (simulated). Try again.")
      onFailure?.("simulated_failure")
      return
    }

    const tx = {
      id: `sim_${Date.now().toString(36)}`,
      amount,
      method,
      status: "success" as const,
      createdAt: new Date().toISOString(),
    }
    onSuccess?.(tx)
    setOpen(false)
  }

  const formatINR = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-xl">{buttonLabel}</Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{descriptor}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="text-2xl font-semibold">{formatINR(amount)}</div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="payer">Payer name (optional)</Label>
              <Input id="payer" placeholder="e.g., Harsh Parikh" value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Payment method</Label>
              <RadioGroup value={method} onValueChange={setMethod} className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-2 rounded-lg border p-2">
                  <RadioGroupItem value="upi" id="m-upi" /> <span>UPI</span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border p-2">
                  <RadioGroupItem value="card" id="m-card" /> <span>Card</span>
                </label>
                <label className="flex items-center gap-2 rounded-lg border p-2">
                  <RadioGroupItem value="netbanking" id="m-netbanking" /> <span>Netbanking</span>
                </label>
              </RadioGroup>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setOpen(false)} disabled={processing}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={pay} disabled={processing}>
                {processing ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing…</>) : "Pay Now"}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              This is a <strong>simulated</strong> payment for demo purposes.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

# Payment Simulator Component

The PaySimulator component provides a demo payment interface for your sports booking application.

## Features

- 🎨 Modern payment form with multiple payment methods
- 💳 Support for Credit/Debit Cards, UPI, Net Banking, and Digital Wallets
- 📱 Mobile-responsive design
- 🔄 Loading states and error handling
- 🧪 90% success rate simulation for testing
- 🛡️ Clearly marked as demo/simulation mode

## Usage

### Basic Implementation

```tsx
import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"

function BookingPage() {
  return (
    <PaySimulator
      amount={1500}
      descriptor="Venue Booking - Basketball Court A"
      buttonLabel="Book & Pay Now"
      onSuccess={(transaction) => {
        console.log("Payment successful:", transaction)
        toast({
          title: "Booking Confirmed!",
          description: `Receipt: ${transaction.id}`,
        })
      }}
      onFailure={() => {
        toast({
          title: "Payment Failed",
          description: "Please try again",
          variant: "destructive",
        })
      }}
    />
  )
}
```

### Tournament Registration

```tsx
import { JoinTournamentButton } from "@/components/join-tournament-button"

function TournamentCard({ tournament }) {
  return (
    <div>
      <h3>{tournament.name}</h3>
      <p>Entry Fee: ₹{tournament.entryFee}</p>
      <JoinTournamentButton fee={tournament.entryFee} />
    </div>
  )
}
```

## Props

### PaySimulator Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `amount` | `number` | Yes | Payment amount in rupees |
| `descriptor` | `string` | Yes | Description of what's being paid for |
| `buttonLabel` | `string` | No | Custom button text (default: "Pay Now") |
| `onSuccess` | `function` | Yes | Callback for successful payment |
| `onFailure` | `function` | Yes | Callback for failed payment |

### Transaction Object

The `onSuccess` callback receives a transaction object:

```tsx
interface PaymentTransaction {
  id: string              // Unique transaction ID
  amount: number          // Payment amount
  status: "success"       // Always "success" in onSuccess callback
  timestamp: Date         // Payment timestamp
  method: string          // Payment method used
  descriptor: string      // Payment description
}
```

## Payment Methods Supported

- **Credit Card**: Full form with card number, expiry, CVV
- **Debit Card**: Same as credit card
- **UPI**: UPI ID input
- **Net Banking**: Bank selection dropdown
- **Digital Wallet**: Simple confirmation

## Integration Examples

### 1. Venue Booking (Already Integrated)
- File: `/app/venues/[id]/booking/page.tsx`
- Replaces the "Proceed to Payment" button
- Shows booking details in payment descriptor

### 2. Tournament Registration (Already Integrated)
- File: `/app/tournaments/page.tsx`
- Replaces "Register Now" button
- Uses entry fee as payment amount

### 3. Custom Implementation

For other use cases, import and use the PaySimulator component:

```tsx
"use client"

import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast"

export function CustomPaymentButton({ 
  amount, 
  itemName 
}: { 
  amount: number
  itemName: string 
}) {
  return (
    <PaySimulator
      amount={amount}
      descriptor={`Purchase - ${itemName}`}
      buttonLabel={`Buy for ₹${amount}`}
      onSuccess={(tx) => {
        // Handle successful purchase
        console.log("Purchase completed:", tx)
        
        // Store purchase data
        const purchaseData = {
          transactionId: tx.id,
          item: itemName,
          amount: amount,
          timestamp: tx.timestamp
        }
        
        // API call (example)
        // fetch("/api/purchases", { 
        //   method: "POST", 
        //   body: JSON.stringify(purchaseData) 
        // })
        
        toast({
          title: "Purchase Successful!",
          description: `You've purchased ${itemName}. Receipt: ${tx.id}`,
        })
      }}
      onFailure={() => {
        toast({
          title: "Purchase Failed",
          description: "Please try again or contact support",
          variant: "destructive",
        })
      }}
    />
  )
}
```

## Notes

- This is a **simulation component** for demo purposes
- No real payment processing occurs
- 90% success rate simulates real-world payment scenarios
- Always includes clear "DEMO MODE" labeling
- 2-second processing delay for realistic feel

## Styling

The component uses Tailwind CSS and shadcn/ui components for consistent styling with your application theme.

## Toast Integration

Make sure you have the toast system set up in your layout:

```tsx
// In your layout.tsx or client-layout.tsx
import { Toaster } from "@/components/ui/toaster"

export default function Layout({ children }) {
  return (
    <div>
      {children}
      <Toaster />
    </div>
  )
}
```

import PaySimulator from "@/components/pay-simulator"
import { toast } from "@/components/ui/use-toast" // if you use shadcn toast

export function JoinTournamentButton({ fee }: { fee: number }) {
  return (
    <PaySimulator
      amount={fee}
      descriptor="Join Tournament"
      buttonLabel="Join & Pay (Sim)"
      onSuccess={(tx) => {
        // mark registration, store receipt, navigate, etc.
        console.log("TX:", tx)
        // example: call your API to confirm the booking
        // await fetch("/api/tournaments/join", { method:"POST", body: JSON.stringify({ tx }) })
        toast?.({ title: "Payment successful", description: `Receipt: ${tx.id}` })
      }}
      onFailure={() => {
        toast?.({ title: "Payment failed", description: "Please try again", variant: "destructive" })
      }}
    />
  )
}

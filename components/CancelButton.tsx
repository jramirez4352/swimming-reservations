"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cancelReservation } from "@/lib/actions/reservation"

export function CancelButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await cancelReservation(reservationId)
    setLoading(false)
  }

  return (
    <Button variant="outline" size="sm" onClick={handle} disabled={loading}>
      {loading ? "Cancelando..." : "Cancelar"}
    </Button>
  )
}

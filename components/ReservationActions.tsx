"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { adminSetReservationStatus, adminDeleteReservation } from "@/lib/actions/reservation"

interface Props {
  reservationId: string
  currentStatus: string
}

export function ReservationActions({ reservationId, currentStatus }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleStatus(newStatus: "ACTIVE" | "CANCELLED") {
    setLoading(newStatus)
    setMsg(null)
    const res = await adminSetReservationStatus(reservationId, newStatus)
    if (res?.error) setMsg(res.error)
    setLoading(null)
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta reserva permanentemente?")) return
    setLoading("delete")
    await adminDeleteReservation(reservationId)
    setLoading(null)
  }

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex gap-1">
        {currentStatus === "CANCELLED" ? (
          <Button
            size="sm"
            variant="outline"
            className="text-green-700 border-green-300 hover:bg-green-50"
            onClick={() => handleStatus("ACTIVE")}
            disabled={!!loading}
          >
            {loading === "ACTIVE" ? "..." : "Reactivar"}
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="text-yellow-700 border-yellow-300 hover:bg-yellow-50"
            onClick={() => handleStatus("CANCELLED")}
            disabled={!!loading}
          >
            {loading === "CANCELLED" ? "..." : "Cancelar"}
          </Button>
        )}
        <Button
          size="sm"
          variant="destructive"
          onClick={handleDelete}
          disabled={!!loading}
        >
          {loading === "delete" ? "..." : "Eliminar"}
        </Button>
      </div>
      {msg && <span className="text-xs text-red-600">{msg}</span>}
    </div>
  )
}

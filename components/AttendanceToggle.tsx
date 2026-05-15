"use client"

import { useState } from "react"
import { markAttendance } from "@/lib/actions/attendance"

interface Props {
  reservationId: string
  initialAttended: boolean
}

export function AttendanceToggle({ reservationId, initialAttended }: Props) {
  const [attended, setAttended] = useState(initialAttended)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const next = !attended
    await markAttendance(reservationId, next)
    setAttended(next)
    setLoading(false)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
        attended
          ? "bg-green-500 border-green-500 text-white"
          : "bg-white border-slate-300 text-transparent hover:border-green-400"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      title={attended ? "Marcar como ausente" : "Marcar como asistió"}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
      </svg>
    </button>
  )
}

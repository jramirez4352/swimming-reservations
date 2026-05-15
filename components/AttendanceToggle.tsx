"use client"

import { useState } from "react"
import { markAttendance } from "@/lib/actions/attendance"

interface Props {
  reservationId: string
  initialAttended: boolean
  initialAbsent?: boolean
}

type Status = "attended" | "absent" | "pending"

export function AttendanceToggle({ reservationId, initialAttended, initialAbsent = false }: Props) {
  const initial: Status = initialAttended ? "attended" : initialAbsent ? "absent" : "pending"
  const [status, setStatus] = useState<Status>(initial)
  const [loading, setLoading] = useState(false)

  async function handle(next: Status) {
    if (next === status || loading) return
    setLoading(true)
    await markAttendance(reservationId, next)
    setStatus(next)
    setLoading(false)
  }

  return (
    <div className={`flex rounded-md overflow-hidden border text-xs font-medium ${loading ? "opacity-50" : ""}`}>
      <button
        onClick={() => handle("attended")}
        disabled={loading}
        title="Asistió"
        className={`px-2 py-1.5 transition-colors ${
          status === "attended"
            ? "bg-green-500 text-white"
            : "bg-white text-slate-400 hover:bg-green-50 hover:text-green-600"
        }`}
      >
        ✓
      </button>
      <button
        onClick={() => handle("absent")}
        disabled={loading}
        title="No asistió"
        className={`px-2 py-1.5 border-l transition-colors ${
          status === "absent"
            ? "bg-red-500 text-white"
            : "bg-white text-slate-400 hover:bg-red-50 hover:text-red-600"
        }`}
      >
        ✗
      </button>
      <button
        onClick={() => handle("pending")}
        disabled={loading}
        title="Pendiente"
        className={`px-2 py-1.5 border-l transition-colors ${
          status === "pending"
            ? "bg-slate-600 text-white"
            : "bg-white text-slate-300 hover:bg-slate-50 hover:text-slate-500"
        }`}
      >
        —
      </button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { joinWaitlist, leaveWaitlist } from "@/lib/actions/waitlist"

interface Props {
  classId: string
  onWaitlist: boolean
}

export function WaitlistButton({ classId, onWaitlist: initialOnWaitlist }: Props) {
  const [onWaitlist, setOnWaitlist] = useState(initialOnWaitlist)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  async function handleJoin() {
    setLoading(true)
    setMsg(null)
    const res = await joinWaitlist(classId)
    if (res?.error) setMsg(res.error)
    else setOnWaitlist(true)
    setLoading(false)
  }

  async function handleLeave() {
    setLoading(true)
    setMsg(null)
    await leaveWaitlist(classId)
    setOnWaitlist(false)
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-1 w-full">
      {onWaitlist ? (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-amber-700 border-amber-300 hover:bg-amber-50"
          onClick={handleLeave}
          disabled={loading}
        >
          {loading ? "..." : "⏳ En lista de espera · Salir"}
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleJoin}
          disabled={loading}
        >
          {loading ? "..." : "Unirse a lista de espera"}
        </Button>
      )}
      {msg && <p className="text-xs text-red-600">{msg}</p>}
    </div>
  )
}

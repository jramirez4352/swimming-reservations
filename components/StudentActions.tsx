"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { suspendStudent, unsuspendStudent } from "@/lib/actions/students"

interface Props {
  userId: string
  suspended: boolean
}

export function StudentActions({ userId, suspended: initialSuspended }: Props) {
  const [suspended, setSuspended] = useState(initialSuspended)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    if (suspended) {
      await unsuspendStudent(userId)
      setSuspended(false)
    } else {
      if (!confirm("¿Suspender esta cuenta? El alumno no podrá iniciar sesión.")) {
        setLoading(false)
        return
      }
      await suspendStudent(userId)
      setSuspended(true)
    }
    setLoading(false)
  }

  return (
    <Button
      size="sm"
      variant={suspended ? "outline" : "destructive"}
      onClick={handleToggle}
      disabled={loading}
      className={suspended ? "text-green-700 border-green-300 hover:bg-green-50" : ""}
    >
      {loading ? "..." : suspended ? "Reactivar" : "Suspender"}
    </Button>
  )
}

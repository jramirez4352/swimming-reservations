"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { deleteClass } from "@/lib/actions/classes"

export function DeleteClassButton({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(false)

  async function handle() {
    if (!confirm("¿Eliminar esta clase y todas sus reservas?")) return
    setLoading(true)
    await deleteClass(classId)
    setLoading(false)
  }

  return (
    <Button variant="destructive" size="sm" onClick={handle} disabled={loading}>
      {loading ? "..." : "Eliminar"}
    </Button>
  )
}

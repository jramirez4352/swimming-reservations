"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { seedDefaultLevels } from "@/lib/actions/level-management"

export function SeedLevelsButton() {
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    await seedDefaultLevels()
    setLoading(false)
    window.location.reload()
  }

  return (
    <Button onClick={handle} disabled={loading}>
      {loading ? "Creando..." : "Crear predeterminados"}
    </Button>
  )
}

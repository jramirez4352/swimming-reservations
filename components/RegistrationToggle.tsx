"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toggleRegistration } from "@/lib/actions/admin-users"

interface Props {
  initialValue: boolean
}

export function RegistrationToggle({ initialValue }: Props) {
  const [enabled, setEnabled] = useState(initialValue)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    const next = !enabled
    if (!next && !confirm("¿Deshabilitar el registro público? Los nuevos usuarios solo podrán ser creados por un admin.")) {
      setLoading(false)
      return
    }
    await toggleRegistration(next)
    setEnabled(next)
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-white">
      <div>
        <p className="font-medium">Registro público</p>
        <p className="text-sm text-muted-foreground">
          {enabled
            ? "Los usuarios pueden registrarse libremente."
            : "Registro deshabilitado — solo admins pueden crear cuentas."}
        </p>
      </div>
      <Button
        onClick={handleToggle}
        disabled={loading}
        variant={enabled ? "destructive" : "default"}
        className={!enabled ? "bg-green-600 hover:bg-green-700" : ""}
      >
        {loading ? "..." : enabled ? "Deshabilitar" : "Habilitar"}
      </Button>
    </div>
  )
}

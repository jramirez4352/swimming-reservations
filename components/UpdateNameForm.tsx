"use client"

import { useActionState } from "react"
import { updateName } from "@/lib/actions/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Props {
  currentName: string
  currentEmail: string
  currentPhone?: string | null
  currentCity?: string | null
  currentAddress?: string | null
}

export function UpdateNameForm({ currentName, currentEmail, currentPhone, currentCity, currentAddress }: Props) {
  const [state, action, pending] = useActionState(updateName, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre completo</Label>
        <Input id="name" name="name" defaultValue={currentName} required />
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={currentEmail} disabled className="bg-muted" />
        <p className="text-xs text-muted-foreground">El email no puede modificarse.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="phone">Teléfono celular</Label>
          <Input id="phone" name="phone" type="tel" defaultValue={currentPhone ?? ""} placeholder="55 1234 5678" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" name="city" defaultValue={currentCity ?? ""} placeholder="Ciudad de México" required />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="address">
          Dirección <span className="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Input id="address" name="address" defaultValue={currentAddress ?? ""} placeholder="Calle, número, colonia" />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Información actualizada correctamente.</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}

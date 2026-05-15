"use client"

import { useActionState } from "react"
import { updateName } from "@/lib/actions/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface Props {
  currentName: string
  currentEmail: string
}

export function UpdateNameForm({ currentName, currentEmail }: Props) {
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
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600">Nombre actualizado correctamente.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  )
}

"use client"

import { useActionState } from "react"
import { updatePassword } from "@/lib/actions/profile"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function UpdatePasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, null)

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="currentPassword">Contraseña actual</Label>
        <Input id="currentPassword" name="currentPassword" type="password" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" name="newPassword" type="password" placeholder="Mínimo 6 caracteres" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Actualizando..." : "Cambiar contraseña"}
      </Button>
    </form>
  )
}

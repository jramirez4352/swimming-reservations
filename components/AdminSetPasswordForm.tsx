"use client"

import { useActionState } from "react"
import { adminSetPassword } from "@/lib/actions/admin-users"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function AdminSetPasswordForm({ userId }: { userId: string }) {
  const action = adminSetPassword.bind(null, userId)
  const [state, formAction, pending] = useActionState(action, null)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="newPassword">Nueva contraseña</Label>
        <Input id="newPassword" name="newPassword" type="password" placeholder="Mínimo 6 caracteres" required />
      </div>
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" required />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Contraseña actualizada correctamente.</p>}
      <Button type="submit" disabled={pending} variant="outline">
        {pending ? "Guardando..." : "Cambiar contraseña"}
      </Button>
    </form>
  )
}

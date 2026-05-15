"use client"

import { useActionState } from "react"
import { resetPassword } from "@/lib/actions/password-reset"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { use } from "react"

export default function ResetPasswordPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const action = resetPassword.bind(null, token)
  const [state, formAction, pending] = useActionState(action, null)

  if (state?.success) {
    return (
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <CardTitle>Contraseña actualizada</CardTitle>
          <CardDescription>Tu contraseña fue restablecida correctamente.</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/login">
            <Button className="w-full">Iniciar sesión</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center">
        <div className="text-4xl mb-2">🔐</div>
        <CardTitle className="text-2xl">Nueva contraseña</CardTitle>
        <CardDescription>Elige una contraseña segura para tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        {state?.error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
            {state.error}
            {state.error.includes("inválido") && (
              <p className="mt-2">
                <Link href="/forgot-password" className="text-red-700 underline font-medium">
                  Solicitar nuevo enlace →
                </Link>
              </p>
            )}
          </div>
        )}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="password">Nueva contraseña</Label>
            <Input id="password" name="password" type="password" placeholder="Mínimo 6 caracteres" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Repite la contraseña" required />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Restablecer contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
